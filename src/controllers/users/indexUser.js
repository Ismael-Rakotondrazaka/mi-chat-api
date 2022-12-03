import { userResource, friendResource } from "#resources/index.js";
import { User } from "#models/index.js";
import { createDataResponse } from "#utils/responses/index.js";

import { Op } from "sequelize";
import jwt from "jsonwebtoken";

const indexUser = async (req, res, next) => {
  let { limit, order, like, count } = req.query;

  let userParams = {
    where: {},
  };

  const processData = async () => {
    const result = await User.findAll(userParams);

    const users = result.map((value) => {
      if (value.Friends?.length === 1) {
        // ! we add explicitly a new property, so DON'T save it
        value.Friendship = value.Friends[0].Friendship;
        return friendResource(value);
      } else {
        let user = userResource(value);

        user.friendship = {
          isFriend: false,
        };

        return user;
      }
    });

    const response = {
      users: users,
    };

    if (count === true || count === "true") {
      // we delete the limit because count is independent of limit
      if (Object.hasOwnProperty.call(userParams, "limit")) {
        delete userParams.limit;
      }

      // we only need the length, so we get the minimum informations
      userParams.attributes = ["id"];

      const result = await User.findAll(userParams);

      response.count = result.length;
    }

    return response;
  };

  try {
    const maxLimit = 200;

    if (/^\d+$/.test(limit)) {
      limit = +limit;
      limit = limit < maxLimit ? limit : maxLimit;
      userParams.limit = limit;
    }

    userParams.order =
      order === "DESC" ? [["firstName", "DESC"]] : [["firstName", "ASC"]];

    if (like && (like + "").trim()) {
      const likeTrimmed = (like + "").trim();
      if (/^[\p{L}\p{M} ]+$/u.test(likeTrimmed)) {
        userParams.where[Op.or] = [
          {
            "$User.first_name$": {
              [Op.substring]: likeTrimmed,
            },
          },
          {
            "$User.last_name$": {
              [Op.substring]: likeTrimmed,
            },
          },
        ];
      } else {
        const result = {
          users: [],
        };

        if (count === true || count === "true") {
          result.count = 0;
        }

        return res.json(createDataResponse(result));
      }
    }

    // we check if the user is authenticated
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (token) {
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        const decoded = jwt.verify(token, accessTokenSecret);

        if (
          !(
            decoded == null ||
            typeof decoded !== "object" ||
            typeof decoded === "string"
          )
        ) {
          const authUser = await User.findOne({
            where: {
              [Op.and]: {
                id: decoded?.user?.id,
                email: decoded?.user?.email,
              },
            },
            attributes: ["id", "email"],
          });

          if (authUser) {
            userParams.include = [
              {
                association: "Friends",
                where: {
                  id: authUser.id,
                },
                required: false,
              },
            ];
          }
        }
      }
    }

    let response = await processData();

    return res.json(createDataResponse(response));
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      req.payload = null;

      return await processData()
        .then((response) => {
          return res.json(createDataResponse(response));
        })
        .catch((error) => {
          next(error);
        });
    } else {
      next(error);
    }
  }
};

export { indexUser };
