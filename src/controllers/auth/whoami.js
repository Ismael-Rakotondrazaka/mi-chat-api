import { User } from "#models/index.js";
import { UnauthorizedError } from "#utils/errors/index.js";
import { createDataResponse } from "#utils/responses/index.js";
import { userResource } from "#resources/index.js";

const whoami = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;

    const authUser = await User.findByPk(authUserId);

    if (!authUser) throw new UnauthorizedError();

    return res.json(
      createDataResponse({
        user: {
          ...userResource(authUser),
          email: authUser.email,
          updatedAt: authUser.updatedAt,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

export { whoami };
