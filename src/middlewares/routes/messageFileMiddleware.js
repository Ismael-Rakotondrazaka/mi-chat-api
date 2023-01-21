import { Conversation, Message } from "#models/index.js";
import { NotFoundError } from "#utils/errors/index.js";

const messageFileMiddleware = async (req, res, next) => {
  try {
    let { conversationId, messageId, filename } = req.params;

    const targetMessage = await Message.findByPk(messageId);

    if (
      targetMessage.type !== "text" &&
      targetMessage.content ===
        `/conversations/${conversationId}/messages/${messageId}/files/${filename}`
    ) {
      next();
    } else {
      next(new NotFoundError());
    }
  } catch (error) {
    next(error);
  }
};

export { messageFileMiddleware };
