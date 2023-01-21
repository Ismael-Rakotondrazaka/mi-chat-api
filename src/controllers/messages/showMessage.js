import {
  Conversation,
  GroupConversationLeft,
  User,
  Message,
} from "../../models/index.js";
import { messageResource } from "../../resources/index.js";
import { isAuthorizedTo } from "../../policies/index.js";
import { createDataResponse } from "../../utils/responses/index.js";

import { Op } from "sequelize";

/*
  this function return messages relative to the one who request it,
  so, two users can have different result:
    - maybe he left the group
    - maybe he delete some messages
*/
const showMessage = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetConversationId = +req.params.conversationId;
    const targetConversation = await Conversation.findByPk(
      targetConversationId
    );

    const targetMessageId = +req.params.messageId;
    const targetMessage = await Message.findByPk(targetMessageId);

    await isAuthorizedTo({
      user: authUser,
      action: "view",
      source: "Message",
      through: targetConversation,
      target: targetMessage,
    });

    const messageParams = {
      where: {
        id: targetMessageId,
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
          id: targetMessageId,
          conversationId: targetConversationId,
          createdAt: {
            [Op.lte]: targetConversationLeft.createdAt,
          },
        };
      }
    }

    let result = (await authUser.getMessages(messageParams))[0];

    const response = {
      message: messageResource(result),
    };

    return res.json(createDataResponse(response));
  } catch (error) {
    next(error);
  }
};

export { showMessage };
