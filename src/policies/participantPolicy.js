import { ForbiddenError } from "#utils/errors/index.js";

import { Op } from "sequelize";

const view = async (data) => {
  const { user, through } = data;

  let result = false;
  const isParticipant = await through.hasParticipant(user);

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
    result = isParticipant;
  }

  if (!result) throw new ForbiddenError();

  return true;
};

// we have the conversation as through
const viewAny = async (data) => {
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
  // target is an array
  const { user, through } = data;

  const result = await through.getParticipants({
    where: {
      id: user.id,
    },
  });

  // only group conversation has role admin
  if (result.length === 1 && result[0].Participant.role === "admin") {
    return true;
  }

  throw new ForbiddenError();
};

const update = async (data) => {
  // target is another user or the user himself
  const { user, target, through } = data;

  let bothParticipants = await through.getParticipants({
    where: {
      id: [user.id, target.id],
    },
  });

  switch (bothParticipants.length) {
    case 2:
      return true;

    case 1:
      if (bothParticipants.at(0).id === user.id) return true;
      break;
  }

  throw new ForbiddenError();
};

const destroy = async (data) => {
  const { user, target, through } = data;

  let result = await through.getParticipants({
    where: {
      id: user.id,
    },
  });

  if (!!result && result.length > 0) {
    result = result.at(0);
    if (through.type === "group" && result.Participant.role === "admin") {
      // we know that target is already in the group but we need his participation
      const targetParticipant = await through.getParticipants({
        where: {
          id: target.id,
        },
      });

      result =
        targetParticipant.at(0).Participant.role === "admin" &&
        targetParticipant.at(0).Participant.userId !== user.id
          ? false
          : true;
    }
  }
  if (!result) throw new ForbiddenError();

  return true;
};

const participantPolicy = { view, viewAny, store, update, destroy };
export default participantPolicy;

export { view, viewAny, store, update, destroy };
