import { User } from "#models/index.js";
import { ForbiddenError } from "#utils/errors/index.js";

import jwt from "jsonwebtoken";
import { Op } from "sequelize";

const authMiddleware = async (req, res, next) => {
  try {
    // Authorization: "Bearer <token here>" expected
    const token = (req.header("Authorization") || "").split(" ")[1];

    if (!token) throw new ForbiddenError();

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const decoded = jwt.verify(token, accessTokenSecret);

    if (
      decoded == null ||
      typeof decoded !== "object" ||
      typeof decoded === "string"
    )
      throw new ForbiddenError();

    const targetUser = await User.findOne({
      where: {
        [Op.and]: {
          id: decoded?.user?.id,
          email: decoded?.user?.email,
        },
      },
      attributes: ["id", "email"],
    });

    if (!targetUser) throw new ForbiddenError();

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
      next(new ForbiddenError());
    } else {
      next(error);
    }
  }
};

export { authMiddleware };
