import { ForbiddenError } from "../utils/errors/index.js";

const update = (data) => {
  // user: User, target: User
  const { user, target } = data;

  // the user and the target user is the same person
  if (user.id === target.id) return true;

  throw new ForbiddenError();
};

const userPolicy = {
  update,
};

export default userPolicy;

export { update };
