import { User } from "../../models/index.js";
import { friendRequestCollection } from "../../resources/index.js";
import { createDataResponse } from "../../utils/responses/index.js";

import { Op } from "sequelize";

const indexFriendRequest = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    let { limit, order, like, count } = req.query;

    let friendRequestsParams = {
      include: [
        {
          association: "Sender",
        },
      ],
    };

    const maxLimit = 200;

    if (/^\d+$/.test(limit)) {
      limit = +limit;
      limit = limit < maxLimit ? limit : maxLimit;
      friendRequestsParams.limit = limit;
    }

    friendRequestsParams.order =
      order === "ASC" ? [["createdAt", "ASC"]] : [["createdAt", "DESC"]];

    if (like && (like + "").trim()) {
      const likeTrimmed = (like + "").trim();

      if (/^[\p{L}\p{M} ]+$/u.test(likeTrimmed)) {
        if (!friendRequestsParams.where) {
          friendRequestsParams.where = {};
        }

        friendRequestsParams.where[Op.or] = [
          {
            $first_name$: {
              [Op.substring]: likeTrimmed,
            },
          },
          {
            $last_name$: {
              [Op.substring]: likeTrimmed,
            },
          },
        ];
      } else {
        //* like is in a bad format

        const response = {
          friendRequests: [],
        };

        if (count === true || count === "true") {
          response.count = 0;
        }

        return res.json(createDataResponse(response));
      }
    }

    const result = await authUser.getFriendRequests(friendRequestsParams);

    let response = {
      friendRequests: friendRequestCollection(result),
    };

    if (count === true || count === "true") {
      // we delete the limit because count is independent of limit
      if (Object.hasOwnProperty.call(friendRequestsParams, "limit")) {
        delete friendRequestsParams.limit;
      }

      // we only need the length, so we get the minimum informations
      friendRequestsParams.attributes = ["id"];

      const result = await authUser.getFriendRequests(friendRequestsParams);

      response.count = result.length;
    }

    return res.json(createDataResponse(response));
  } catch (error) {
    next(error);
  }
};

export { indexFriendRequest };
