import { User, Conversation, Viewer } from "../../models/index.js";
import { socketIO } from "../../services/socketIO/index.js";
import { isAuthorizedTo } from "../../policies/index.js";
import { createDataResponse } from "../../utils/responses/index.js";

import { Op } from "sequelize";

// delete views of auth User, not the conversation itself
const destroyConversation = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetConversationId = +req.params.conversationId;
    const targetConversation = await Conversation.findByPk(
      targetConversationId
    );

    await isAuthorizedTo({
      user: authUser,
      action: "destroy",
      source: "Conversation",
      target: targetConversation,
    });

    // get all messages of auth User from the targetConversation
    const targetMessages = await authUser.getMessages({
      where: {
        conversationId: targetConversation.id,
      },
      attributes: ["id"],
    });

    const targetMessagesIds = targetMessages.map((message) => message.id);

    // then we destroy the view of authUser, NOT the message itself
    await Viewer.destroy({
      where: {
        [Op.and]: {
          userId: authUser.id,
          messageId: targetMessagesIds,
        },
      },
    });

    const response = createDataResponse({
      conversation: {
        id: targetConversationId,
      },
    });

    // notify auth users
    socketIO.to(authUser.channelId).emit("conversations:destroy", response);

    return res.json(response);
  } catch (error) {
    next(error);
  }
};

export { destroyConversation };
