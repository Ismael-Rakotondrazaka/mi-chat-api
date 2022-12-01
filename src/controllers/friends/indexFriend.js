import { User } from "#models/index.js";
import { friendCollection } from "#resources/index.js";
import { createDataResponse } from "#utils/responses/index.js";

import { Op } from "sequelize";

const indexFriend = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    // * like is independent of limit
    let { limit, order, like, count } = req.query;

    // the query used when fetching the result
    let messageParams = {};

    if (/^\d+$/.test(limit)) {
      limit = parseInt(limit, 10);
      limit = limit < 200 ? limit : 200;
      messageParams.limit = limit;
    }

    messageParams.order =
      order === "DESC" ? [["firstName", "DESC"]] : [["firstName", "ASC"]];

    if (like && (like + "").trim()) {
      const likeTrimmed = (like + "").trim();

      // TODO update validation of firstName and lastName, because we forgot about the format and whitespace
      if (/^[\p{L}\p{M} ]+$/u.test(likeTrimmed)) {
        if (!messageParams.where) {
          messageParams.where = {};
        }

        messageParams.where[Op.or] = [
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
        /*
          since the like is in a bad format,
          we return an empty response,
          ! and we don't throw an error
        */
        const response = {
          users: [],
        };

        if (count === true || count === "true") {
          response.count = 0;
        }

        return res.json(createDataResponse(response));
      }
    }

    const result = await authUser.getFriends(messageParams);

    let response = {
      users: friendCollection(result),
    };

    if (count === true || count === "true") {
      // ! we delete the limit because count is independent of limit
      if (Object.hasOwnProperty.call(messageParams, "limit")) {
        delete messageParams.limit;
      }

      // we only need the length, so we get the minimum informations
      messageParams.attributes = ["id"];

      const result = await authUser.getFriends(messageParams);

      response.count = result.length;
    }

    return res.json(createDataResponse(response));
  } catch (error) {
    next(error);
  }
};

export { indexFriend };
