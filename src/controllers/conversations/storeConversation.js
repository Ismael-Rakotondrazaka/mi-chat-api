import { User, Conversation, Participant } from "#models/index.js";
import { BadRequestError } from "#utils/errors/index.js";
import {
  validateConversationName,
  validateConversationDescription,
  createRandomString,
  createFilename,
} from "#utils/strings/index.js";
import { createDataResponse } from "#utils/responses/index.js";
import { conversationConfig } from "#configs/index.js";
import { socketIO } from "#services/socketIO/index.js";
import { uploadFile } from "#services/GCS/index.js";

import { Op } from "sequelize";

//* here we store a group conversation, since personal is created when accepting a friendRequest
const storeConversation = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    let { groupName, description, participants } = req.body;
    let profileImage = req.file;

    const FIELDS_REQUIRED = [
      {
        name: "groupName",
        code: "E2_24",
      },
      {
        name: "participants",
        code: "E2_25",
      },
    ];

    for (const field of FIELDS_REQUIRED) {
      const data = req.body[field.name];
      if (!data)
        throw new BadRequestError(`Field '${field.name}' is required.`, {
          code: field.code,
        });
    }

    groupName = validateConversationName(groupName);

    if (description) {
      description = validateConversationDescription(description);
    }

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

    // check if participantsId has the minimum required length
    // ! minLength - 1, because authUser will be added later
    if (
      participantsId.length <
      conversationConfig.MIN_GROUP_PARTICIPANT_COUNT - 1
    )
      throw new BadRequestError(
        `Field 'participants' doesn't contain enough user id. ${
          conversationConfig.MIN_GROUP_PARTICIPANT_COUNT - 1
        } is the minimum required length.`,
        {
          code: "E2_35",
        }
      );

    // check if Ids of participantsId exist
    const { count: usersCount } = await User.findAndCountAll({
      where: {
        id: {
          [Op.in]: participantsId,
        },
      },
      attributes: ["id"],
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

    // we create a new conversation, and we create participants later
    // TODO if profileImage exist, upload it. Then update the imageUrl of this conversation
    let targetConversation = await Conversation.create({
      name: groupName,
      channelId: createRandomString(),
      type: "group",
    });

    // array containing infos about participants
    let participantsParam;

    // we add the participants with role participant
    participantsParam = participantsId.map((id) => ({
      user_id: id,
      conversation_id: targetConversation.id,
      role: "participant",
    }));

    // add auth user as admin
    participantsParam.push({
      user_id: authUserId,
      role: "admin",
      conversation_id: targetConversation.id,
    });

    // create participants
    // ! it returns something, but they doesn't reflect the actual state in the db, se need to refetch them once again
    await Participant.bulkCreate(participantsParam);

    // edit targetConversion, but with participants
    targetConversation = await Conversation.findByPk(targetConversation.id, {
      include: [
        {
          association: "Participants",
          attributes: ["id", "channelId"],
        },
      ],
    });

    const spreadUpdates = () => {
      // notify each participants infos about the new conversation
      targetConversation.Participants.forEach((participant) => {
        socketIO.to(participant.channelId).emit(
          "conversations:store",
          createDataResponse({
            conversation: {
              id: targetConversation.id,
            },
          })
        );
      });

      /*
            since the informations about a conversation are huge,
            we prefer to send back only the conversationId
            the client need to fetch those informations in another request
           */
      res.json(
        createDataResponse({
          conversation: {
            id: targetConversation.id,
          },
        })
      );
    };

    if (profileImage) {
      const mimetype = profileImage.mimetype;
      const originalName = profileImage.originalname;
      const filename = createFilename(originalName, mimetype);
      const imageUrl = `/conversations/${targetConversation.id}/files/${filename}`;
      const destination = `private/conversations/${targetConversation.id}/${filename}`;

      uploadFile(profileImage.buffer, {
        destination,
        contentType: mimetype,
        onFinish: async () => {
          await targetConversation.update({
            imageUrl: imageUrl,
          });

          spreadUpdates();
        },
        onError: (err) => next(err),
        isPrivate: true,
      });
    } else {
      spreadUpdates();
    }
  } catch (error) {
    next(error);
  }
};

export { storeConversation };
