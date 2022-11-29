import { User } from "#models/index.js";
import { friendRequestCollection } from "#resources/index.js";
import { createDataResponse } from "#utils/responses/index.js";

import { Op } from "sequelize";

const indexFriendRequest = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    let { limit, order, like } = req.query;

    let friendRequestsParams = {
      include: [
        {
          association: "Sender",
        },
      ],
      where: {},
    };

    const maxLimit = 200;

    if (/^\d+$/.test(limit)) {
      limit = parseInt(limit, 10);
      limit = limit < maxLimit ? limit : maxLimit;
      friendRequestsParams.limit = limit;
    }

    if (!!order) {
      friendRequestsParams.order =
        order === "ASC" ? [["createdAt", "ASC"]] : [["createdAt", "DESC"]];
    }

    if (like) {
      if (/[\p{L}\p{M} -']+/u.test(like)) {
        friendRequestsParams.where[Op.or] = [
          {
            $first_name$: {
              [Op.substring]: like,
            },
          },
          {
            $last_name$: {
              [Op.substring]: like,
            },
          },
        ];
        const result = await authUser.getFriendRequests(friendRequestsParams);

        return res.json(
          createDataResponse({
            friendRequests: friendRequestCollection(result),
          })
        );
      } else {
        return res.json(
          createDataResponse({
            friendRequests: [],
          })
        );
      }
    }

    const result = await authUser.getFriendRequests({
      include: ["Sender"],
    });

    return res.json(
      createDataResponse({
        friendRequests: friendRequestCollection(result),
      })
    );
  } catch (error) {
    next(error);
  }
};

export { indexFriendRequest };
