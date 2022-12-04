import { Conversation } from "#models/index.js";
import { NotFoundError } from "#utils/errors/index.js";

const participantMiddleware = async (req, res, next) => {
  let { conversationId, participantId } = req.params;

  if (/^\d+$/.test(participantId)) {
    participantId = +participantId;

    const targetConversation = await Conversation.findByPk(conversationId);

    const targetParticipant = await targetConversation.getParticipants({
      where: {
        id: participantId,
      },
    });

    if (targetParticipant.length > 0) {
      next();
    } else {
      next(new NotFoundError());
    }
  } else {
    next(new NotFoundError());
  }
};

export { participantMiddleware };
