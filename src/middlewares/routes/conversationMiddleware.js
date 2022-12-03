import { Conversation } from "#models/index.js";
import { NotFoundError } from "#utils/errors/index.js";

const conversationMiddleware = async (req, res, next) => {
  try {
    let { conversationId } = req.params;

    if (
      !/^\d+$/.test(conversationId) ||
      !(await Conversation.findByPk(+conversationId))
    ) {
      next(new NotFoundError());
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

export { conversationMiddleware };
