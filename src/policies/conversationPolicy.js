import { ForbiddenError } from "../utils/errors/index.js";

const view = async (data) => {
  // user:User, target:Conversation
  const { user, target } = data;
  let result = false;

  // check if the user is a participant of the conversation
  const isParticipant = await target.hasParticipant(user);

  if (target.type === "personal") {
    result = isParticipant;
  } else if (target.type === "group") {
    /*
      if the conversation is a group and if user is not a participant, may be the user left the conversation
    */

    if (!isParticipant) {
      const groupConversationLeft = await user.getGroupConversationsLeft({
        where: {
          conversationId: target.id,
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

const update = async (data) => {
  // user:User, target:Conversation
  const { user, target } = data;

  // check if user is a member of the group conversation
  let result = await target.getParticipants({
    where: {
      id: user.id,
    },
  });

  // check if the conversation is a group and if user is admin
  if (!!result && result.length === 1) {
    result = result.at(0);
    if (target.type === "group" && result.Participant.role === "admin") {
      return true;
    }
  }

  throw new ForbiddenError();
};

const destroy = async (data) => {
  // user:User, target:Conversation
  const { user, target } = data;

  // check if user is a participant
  const result = await target.hasParticipant(user);

  if (result) {
    return true;
  }

  throw new ForbiddenError();
};

const conversationPolicy = { destroy, view, update };
export default conversationPolicy;

export { destroy, view, update };
