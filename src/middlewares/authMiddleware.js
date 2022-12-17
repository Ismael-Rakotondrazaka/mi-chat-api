import { User } from "#models/index.js";
import { ForbiddenError } from "#utils/errors/index.js";
import { errorConfig } from "#configs/index.js";

import jwt from "jsonwebtoken";
import { Op } from "sequelize";

const authMiddleware = async (req, res, next) => {
  try {
    // authorization: "Bearer <token here>" expected
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer "))
      throw new ForbiddenError(errorConfig.DEFAULT_FORBIDDEN_ERROR_MESSAGE, {
        code: "E6_1",
      });

    const token = authHeader.split(" ")[1];

    if (!token) throw new ForbiddenError();

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const decoded = jwt.verify(token, accessTokenSecret);

    if (
      decoded == null ||
      typeof decoded !== "object" ||
      typeof decoded === "string"
    )
      throw new ForbiddenError(errorConfig.DEFAULT_FORBIDDEN_ERROR_MESSAGE, {
        code: "E6_1",
      });

    const targetUser = await User.findOne({
      where: {
        [Op.and]: {
          id: decoded?.user?.id,
          email: decoded?.user?.email,
        },
      },
      attributes: ["id", "email"],
    });

    if (!targetUser)
      throw new ForbiddenError(errorConfig.DEFAULT_FORBIDDEN_ERROR_MESSAGE, {
        code: "E6_1",
      });

    /*
      we add the payload to the request object to mark as authenticated
    */
    req.payload = {
      user: {
        id: targetUser.id,
        email: targetUser.email,
      },
    };

    next();
  } catch (error) {
    // we mark the req.payload as null if auth failed
    req.payload = null;

    if (error instanceof jwt.JsonWebTokenError) {
      next(
        new ForbiddenError(errorConfig.DEFAULT_FORBIDDEN_ERROR_MESSAGE, {
          code: "E6_1",
        })
      );
    } else {
      next(error);
    }
  }
};

export { authMiddleware };
