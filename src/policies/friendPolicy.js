import { ForbiddenError } from "../utils/errors/index.js";

const destroy = async (data) => {
  const { user, target } = data;

  const result = await user.hasFriend(target);

  if (result) return true;

  throw new ForbiddenError();
};

const friendPolicy = { destroy };

export default friendPolicy;

export { destroy };
