import { Conversation, Message } from "../../models/index.js";
import { NotFoundError } from "../../utils/errors/index.js";

const messageMiddleware = async (req, res, next) => {
  try {
    let { conversationId, messageId } = req.params;

    if (/^\d+$/.test(messageId)) {
      messageId = +messageId;

      const targetConversation = await Conversation.findByPk(+conversationId);

      const targetMessage = await Message.findByPk(messageId);

      if (
        targetMessage &&
        targetMessage.conversationId === targetConversation.id
      ) {
        next();
      } else {
        next(new NotFoundError());
      }
    } else {
      next(new NotFoundError());
    }
  } catch (error) {
    next(error);
  }
};

export { messageMiddleware };
