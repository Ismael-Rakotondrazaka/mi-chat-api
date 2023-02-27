import { ForbiddenError } from "../utils/errors/index.js";

import { Op } from "sequelize";

const view = async (data) => {
  // user:User, target:Message
  const { user, target } = data;

  if (!(await target.hasViewer(user))) throw new ForbiddenError();

  return true;
};

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

const store = async (data) => {
  // user:User, through:Conversation
  const { user, through } = data;

  let result = false;

  if (through.type === "personal") {
    const converserParticipantFetched = (
      await through.getParticipants({
        where: {
          id: {
            [Op.ne]: user.id,
          },
        },
      })
    )[0];

    const friendFetched =
      (
        await user.getFriends({
          where: {
            id: converserParticipantFetched.id,
          },
        })
      )[0] || null;

    if (friendFetched) {
      result = true;
    }
  } else if (through.type === "group") {
    const isParticipant = await through.hasParticipant(user);
    result = isParticipant;
  }

  if (!result) throw new ForbiddenError();

  return true;
};

const destroy = async (data) => {
  // user:User, target: , through:Conversation
  const { user, target, through } = data;

  const isViewer = await target.hasViewer(user);

  let result = false;

  if (isViewer) {
    if (through.type === "personal") {
      result = true;
    } else if (through.type === "group") {
      const isParticipant = await through.hasParticipant(user);

      if (!isParticipant) {
        const groupConversationLeft = await user.getGroupConversationsLeft({
          where: { conversationId: through.id },
        });

        if (
          groupConversationLeft.length > 0 &&
          // normally it's not needed
          target.createdAt <= groupConversationLeft[0].createdAt
        ) {
          result = true;
        }
      } else {
        result = true;
      }
    }
  }

  if (!result) throw new ForbiddenError();

  return true;
};

const messagePolicy = { view, viewAny, destroy, store };
export default messagePolicy;

export { view, viewAny, destroy, store };
