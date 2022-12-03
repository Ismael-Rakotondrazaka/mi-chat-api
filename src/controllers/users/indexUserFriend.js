import { userResource, friendResource } from "#resources/index.js";
import { User } from "#models/index.js";
import { createDataResponse } from "#utils/responses/index.js";

import { Op } from "sequelize";
import jwt from "jsonwebtoken";

const indexUserFriend = async (req, res, next) => {
  /*
     the results depends on the auth state, so we create functions to handle it for both case
    */

  let { limit, order, like, count, mutual } = req.query;
  const targetUserId = +req.params.userId;

  let userParams = {
    include: [
      {
        association: "Friends",
      },
    ],
    where: {},
  };

  const processData = async () => {
    const targetUser = await User.findByPk(targetUserId);

    const friends = await targetUser.getFriends(userParams);

    const result = friends.map((friend) => {
      let friendObject;

      if (friend?.Friends?.length === 1) {
        // ! we explicitly add a Friendship property, so DON'T save it
        friend.Friendship = friend.Friends.at(0).Friendship;

        friendObject = friendResource(friend);
      } else {
        friendObject = userResource(friend);

        friendObject.friendship = {
          isFriend: false,
        };
      }

      return friendObject;
    });

    const response = {
      users: result,
    };

    if (count === true || count === "true") {
      // we delete the limit because count is independent of limit
      if (Object.hasOwnProperty.call(userParams, "limit")) {
        delete userParams.limit;
      }

      // we only need the length, so we get the minimum informations
      userParams.attributes = ["id"];

      const friends = await targetUser.getFriends(userParams);

      response.count = friends.length;
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
                attributes: ["id"],
                where: {
                  "$Friends.id$": authUser.id,
                },
                required: !!mutual,
              },
            ];
          }
        }
      }
    }

    let response = await processData();

    return res.json(createDataResponse(response));
  } catch (error) {
    /*
        we can have a jwt Error here, that means the auth is failed,
        but we don't want to send a forbidden response;
        instead, we try to process as unauthenticated
      */
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

export { indexUserFriend };
