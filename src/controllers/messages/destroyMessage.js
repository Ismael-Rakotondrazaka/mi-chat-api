import { User, Message, Conversation } from "../../models/index.js";
import { socketIO } from "../../services/socketIO/index.js";
import { isAuthorizedTo } from "../../policies/index.js";
import { createDataResponse } from "../../utils/responses/index.js";

const destroyMessage = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetMessageId = +req.params.messageId;
    const targetMessage = await Message.findByPk(targetMessageId);

    const targetConversationId = parseInt(req.params.conversationId, 10);
    const targetConversation = await Conversation.findByPk(
      targetConversationId
    );

    await isAuthorizedTo({
      user: authUser,
      action: "destroy",
      source: "Message",
      target: targetMessage,
      through: targetConversation,
    });

    await targetMessage.removeViewer(authUser);

    const response = {
      conversation: {
        id: targetConversationId,
        messages: [targetMessageId],
      },
    };

    socketIO
      .to(authUser.channelId)
      .emit("messages:destroy", createDataResponse(response));

    return res.json(createDataResponse(response));
  } catch (error) {
    next(error);
  }
};

export { destroyMessage };
