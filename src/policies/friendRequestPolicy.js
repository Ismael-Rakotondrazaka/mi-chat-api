import { ForbiddenError } from "#utils/errors/index.js";

const destroy = (data) => {
  // user:the sender or the receiver User, target:FriendRequest
  const { user, target } = data;

  // the sender or the receiver can delete
  if (target.senderId === user.id || target.receiverId === user.id) return true;

  throw new ForbiddenError();
};

const update = (data) => {
  // user:User, target:FriendRequest
  const { user, target } = data;

  if (user.id === target.receiverId) return true;

  throw new ForbiddenError();
};

export default { destroy, update };

export { destroy, update };
