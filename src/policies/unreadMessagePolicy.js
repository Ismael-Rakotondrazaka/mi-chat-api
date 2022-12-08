import { ForbiddenError } from "#utils/errors/index.js";

const viewAny = async (data) => {
  // user:User, through:Conversation
  const { user, through } = data;
  let result = false;
  const isParticipant = await through.hasParticipant(user);

  if (through.type === "personal") {
    result = isParticipant;
  } else if (through.type === "group") {
    if (!isParticipant) {
      const groupConversationLeft = await user.getGroupConversationsLeft({
        where: {
          conversationId: through.id,
        },
      });
      if (groupConversationLeft.length > 0) {
        result = true;
      }
    } else {
      result = true;
    }
  }

  if (!result) throw new ForbiddenError();

  return true;
};

const destroy = async (data) => {
  // user:User, through:Conversation
  const { user, through } = data;

  let result = false;
  const isParticipant = await through.hasParticipant(user);

  if (through.type === "personal") {
    result = isParticipant;
  } else if (through.type === "group") {
    if (!isParticipant) {
      const groupConversationLeft = await user.groupConversationLeft({
        where: {
          conversationId: through.id,
        },
      });
      if (groupConversationLeft.length > 0) {
        result = true;
      }
    } else {
      result = true;
    }
  }

  if (!result) throw new ForbiddenError();

  return true;
};

const unreadMessagesPolicy = {
  viewAny,
  destroy,
};
export default unreadMessagesPolicy;

export { viewAny, destroy };
