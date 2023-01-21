import { Conversation, GroupConversationLeft, User } from "#models/index.js";
import { messageCollection } from "#resources/index.js";
import { BadRequestError } from "#utils/errors/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { createDataResponse } from "#utils/responses/index.js";

import { Op } from "sequelize";

/*
  this function return messages relative to the one who request it,
  so, two users can have different result:
    - maybe he left the group
    - maybe he delete some messages
*/
const indexMessage = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetConversationId = +req.params.conversationId;
    const targetConversation = await Conversation.findByPk(
      targetConversationId
    );

    let { limit, maxAge, before, order, type } = req.query;

    await isAuthorizedTo({
      user: authUser,
      action: "viewAny",
      source: "Message",
      through: targetConversation,
    });

    const messageParams = {
      where: {
        conversationId: targetConversationId,
      },
      include: [
        {
          association: "Sender",
          include: [
            {
              where: {
                conversationId: targetConversationId,
              },
              // the sender will be known even if he is not part of the conversation.
              required: false,
              association: "Participations",
            },
          ],
        },
      ],
    };

    if (targetConversation.type === "group") {
      const isParticipant = await targetConversation.getParticipants({
        where: {
          id: authUserId,
        },
      });

      // * it means, this user leave the group
      if (isParticipant.length === 0) {
        const targetConversationLeft = (
          await GroupConversationLeft.findAll({
            where: {
              conversationId: targetConversationId,
              userId: authUserId,
            },
          })
        )[0];

        messageParams.where = {
          conversationId: targetConversationId,
          createdAt: {
            [Op.lte]: targetConversationLeft.createdAt,
          },
        };
      }
    }

    if (/^\d+$/.test(limit)) {
      limit = +limit;
      limit = limit < 200 ? limit : 200;
      messageParams.limit = limit;
    }

    if (/^\d+$/.test(maxAge)) {
      const temp = new Date(+maxAge);
      if (!Number.isNaN(temp.getTime())) {
        messageParams.where.createdAt = {
          [Op.gte]: temp.toISOString(),
        };
      }
    }

    if (/^\d+$/.test(before)) {
      const temp = new Date(+before);
      if (!Number.isNaN(temp.getTime())) {
        messageParams.where.createdAt = {
          [Op.lt]: temp.toISOString(),
        };
      }
    }

    messageParams.order = [["createdAt", "DESC"]];

    if (type) {
      switch (type) {
        case "text":
          messageParams.where.type = "text";
          break;

        case "image":
          messageParams.where.type = "image";
          break;

        case "file":
          messageParams.where.type = "file";

        default:
          let data = [];
          if (typeof type === "string") {
            try {
              data = JSON.parse(type);
            } catch (error) {
              throw new BadRequestError("Invalid type of message.", false);
            }
          } else if (Array.isArray(type)) {
            data = type;
          }
          let types = [];
          if (data.includes("text")) types.push("text");
          if (data.includes("image")) types.push("image");
          if (data.includes("video")) types.push("video");
          if (data.includes("file")) types.push("file");

          if (types.length >= 1 && types.length != 4) {
            messageParams.where.type = types;
          }
          break;
      }
    }

    let result = await authUser.getMessages(messageParams);

    if (order !== "ASC") {
      result = result.reverse();
    }

    const response = {
      messages: messageCollection(result),
    };

    return res.json(createDataResponse(response));
  } catch (error) {
    next(error);
  }

  /*
  ! if we want to get all messages from a conversation
  ! (no regarding if a message has been deleted by any user),
  ! then messageCollection won't work
    const messages = await targetConversation.getMessages(messageParams);
    const result = messageCollection(messages); // ! not working
  */
};

export { indexMessage };
