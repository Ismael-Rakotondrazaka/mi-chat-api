import { User, Conversation, GroupConversationLeft } from "../../models/index.js";
import { BadRequestError, ConflictError } from "../../utils/errors/index.js";
import { socketIO } from "../../services/socketIO/index.js";
import { isAuthorizedTo } from "../../policies/index.js";
import { createDataResponse } from "../../utils/responses/index.js";

import { Op } from "sequelize";

const storeParticipant = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetConversationId = +req.params.conversationId;
    const targetConversation = await Conversation.findByPk(
      targetConversationId
    );

    await isAuthorizedTo({
      user: authUser,
      action: "store",
      source: "Participant",
      through: targetConversation,
    });

    const { participants } = req.body;

    if (!participants)
      throw new BadRequestError("Field 'participants' is required.", {
        code: "E2_25",
      });

    /*
      we validate the participants field here
    */

    /*
      array of participants' id
      - should not contains the authUserId,
      - should have a valid length
      - users with ids should exit
      - users with ids should be friend with authUser
    */
    let participantsId;
    let tempParticipantsId;

    if (Array.isArray(participants)) {
      tempParticipantsId = participants;
    } else if (typeof participants === "string") {
      tempParticipantsId = participants.split(",");
    } else {
      throw new BadRequestError("Field 'participants' is in a bad format.", {
        code: "E2_26",
      });
    }

    // check if the array given is an array of valid ids
    const isArrayOfInt = tempParticipantsId.every((value) => {
      return /^\d+$/.test(value);
    });
    if (!isArrayOfInt)
      throw new BadRequestError(
        "Id in field 'participants' are in a bad format.",
        {
          code: "E2_27",
        }
      );

    participantsId = tempParticipantsId.map((val) => +val);

    // check if the participantsId contains authUserId
    if (participantsId.includes(authUserId))
      throw new BadRequestError("Field 'participants' contains auth user id.", {
        code: "E2_28",
      });

    // check if participantsId has the minimum required length (1 here)
    if (participantsId.length < 1)
      throw new BadRequestError(
        `Field 'participants' doesn't contain enough user id. 1 is the minimum required length.`,
        {
          code: "E2_35",
        }
      );

    // check if Ids of participantsId exist
    const { count: usersCount, rows: targetUsers /* need it later */ } =
      await User.findAndCountAll({
        where: {
          id: {
            [Op.in]: participantsId,
          },
        },
      });

    if (usersCount !== participantsId.length)
      throw new BadRequestError(
        "Users in field 'participants' does not exist.",
        {
          code: "E2_29",
        }
      );

    // check if users in participantsId are friends with authUser
    const friendsCount = (
      await authUser.getFriends({
        where: {
          id: {
            [Op.in]: participantsId,
          },
        },
        attributes: ["id"],
      })
    ).length;
    if (friendsCount !== usersCount)
      throw new BadRequestError(
        "Users in field 'participants' are not friends with auth user.",
        {
          code: "E2_30",
        }
      );

    // check if participants is not already participants
    const oldParticipants = await targetConversation.getParticipants({
      where: {
        id: participantsId,
      },
    });
    if (oldParticipants.length !== 0)
      throw new ConflictError(
        "One or more users in 'participants' are already members of the conversation.",
        {
          code: "E4_6",
        }
      );

    /* 
      for each new participant, we delete the conversation left if they left
    */
    const groupConversationLeft = await GroupConversationLeft.findAll({
      where: {
        [Op.and]: [
          {
            conversationId: targetConversationId,
          },
          {
            userId: {
              [Op.in]: participantsId,
            },
          },
        ],
      },
    });
    await Promise.all(
      groupConversationLeft.map(async (value) => {
        await value.destroy();
      })
    );

    // then we add new participants to the conversation
    await targetConversation.addParticipants(targetUsers);

    targetConversation.changed("updatedAt", true);
    await targetConversation.update({
      updatedAt: new Date(),
    });

    const response = {
      conversation: {
        id: targetConversationId,
        updatedAt: targetConversation.updatedAt,
        participants: participantsId,
      },
    };

    // we notify each members of the conversation about new participants
    socketIO
      .to(targetConversation.channelId)
      .emit("participants:store", createDataResponse(response));

    // we notify each participant bout the new conversation
    targetUsers.forEach((user) => {
      socketIO.to(user.channelId).emit(
        "conversations:store",
        createDataResponse({
          conversation: {
            id: targetConversationId,
          },
        })
      );
    });

    return res.json(createDataResponse(response));
  } catch (error) {
    next(error);
  }
};

export { storeParticipant };
