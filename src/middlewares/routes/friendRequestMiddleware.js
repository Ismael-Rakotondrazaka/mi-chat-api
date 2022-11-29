import { FriendRequest } from "#models/index.js";
import { NotFoundError } from "#utils/errors/index.js";

const friendRequestMiddleware = async (req, res, next) => {
  try {
    let { friendRequestId } = req.params;

    if (
      !/^\d+$/.test(friendRequestId) ||
      !(await FriendRequest.findByPk(+friendRequestId))
    ) {
      next(new NotFoundError());
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

export { friendRequestMiddleware };
