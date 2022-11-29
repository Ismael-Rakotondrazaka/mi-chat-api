import { User } from "#models/index.js";
import { NotFoundError } from "#utils/errors/index.js";

const userMiddleware = async (req, res, next) => {
  try {
    let { userId } = req.params;

    if (!/^\d+$/.test(userId) || !(await User.findByPk(+userId))) {
      next(new NotFoundError());
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

export { userMiddleware };
