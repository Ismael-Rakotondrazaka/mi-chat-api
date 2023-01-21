import { userResource, friendResource, userCollection } from "../../resources/index.js";
import { User } from "../../models/index.js";
import { createDataResponse } from "../../utils/responses/index.js";

import { Op } from "sequelize";
import jwt from "jsonwebtoken";

const indexUserFriend = async (req, res, next) => {
  /*
     the results depends on the auth state, so we create functions to handle it for both case
    */

     // TODO add more query features
  let { /* limit, order, like, count, */ mutual } = req.query;
  const targetUserId = +req.params.userId;

  const processWithAuth = async (targetUserId = 0, authUserId = 0) => {
    /*
        we get with the targetUser with:
        - his friends,
        - the friendship between his friends and the auth user
      */
    const targetUser = await User.findByPk(targetUserId, {
      include: {
        association: "Friends",
        include: {
          association: "Friends",
          where: {
            "$Friends.Friends.id$": {
              [Op.eq]: authUserId,
            },
          },
          required: !!mutual,
        },
      },
    });

    let result = {
      users: targetUser.Friends.map((friend) => {
        let friendObject = {};

        if (friend.Friends.length === 1) {
          // ! we add explicitly a new property, so DON'T save it
          friend.Friendship = friend.Friends.at(0).Friendship;
          friendObject = friendResource(friend);
        } else {
          friendObject = userResource(friend);

          friendObject.friendship = {
            isFriend: false,
          };
        }

        return friendObject;
      }),
    };

    return result;
  };

  const processWithoutAuth = async (targetUserId = 0) => {
    const targetUser = await User.findByPk(targetUserId, {
      include: {
        association: "Friends",
      },
    });

    // explicitly add a falsy friendship because the request is not authenticated
    let result = {
      users: userCollection(targetUser.Friends).map((user) => {
        user.friendship = {
          isFriend: false,
        };

        return user;
      }),
    };

    return result;
  };

  let isAuthenticated = false;
  // const targetUserId = +req.params.userId;

  try {
    let authUserId;

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
            isAuthenticated = true;
            authUserId = authUser.id;
          }
        }
      }
    }

    let result;

    // authenticated
    if (isAuthenticated) {
      result = await processWithAuth(targetUserId, authUserId);
    } else {
      result = await processWithoutAuth(targetUserId);
    }

    return res.json(createDataResponse(result));
  } catch (error) {
    /*
        we can have a jwt Error here, that means the auth is failed,
        but we don't want to send a forbidden response;
        instead, we try to process as unauthenticated
      */
    if (error instanceof jwt.JsonWebTokenError) {
      req.payload = null;

      return await processWithoutAuth(targetUserId)
        .then((result) => {
          return res.json(createDataResponse(result));
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
