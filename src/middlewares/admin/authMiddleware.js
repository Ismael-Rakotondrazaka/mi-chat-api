import { User } from "#models/index.js";
import { ForbiddenError } from "#utils/errors/index.js";
import { errorConfig } from "#configs/index.js";

import jwt from "jsonwebtoken";
import { Op } from "sequelize";

const authMiddleware = async (req, res, next) => {
  try {
    // authorization: "Bearer <token here>" expected
    const authHeader =
      req.headers.authorization || req.headers.Authorization || req.query.t;

    if (!authHeader?.startsWith("Bearer "))
      throw new ForbiddenError(errorConfig.DEFAULT_FORBIDDEN_ERROR_MESSAGE, {
        code: "E6_1",
      });

    const token = authHeader.split(" ")[1];

    if (!token) throw new ForbiddenError();

    // ! make sure we use the admin access token as reference
    const accessTokenSecret = process.env.ADMIN_ACCESS_TOKEN_SECRET;
    const decoded = jwt.verify(token, accessTokenSecret);

    if (
      decoded == null ||
      typeof decoded !== "object" ||
      typeof decoded === "string"
    )
      throw new ForbiddenError(errorConfig.DEFAULT_FORBIDDEN_ERROR_MESSAGE, {
        code: "E6_1",
      });

    if (
      !Object.hasOwnProperty.call(decoded, "role") ||
      !["admin"].includes(decoded.role)
    )
      throw new ForbiddenError(errorConfig.DEFAULT_FORBIDDEN_ERROR_MESSAGE, {
        code: "E6_1",
      });

    /*
      we add the payload to the request object to mark as authenticated
    */
    req.payload = {
      admin: decoded,
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
