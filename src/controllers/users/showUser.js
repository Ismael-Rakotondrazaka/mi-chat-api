import {
  userResource,
  userCollection,
  friendResource,
  friendRequestResource,
} from "../../resources/index.js";
import { User, FriendRequest } from "../../models/index.js";
import { createDataResponse } from "../../utils/responses/index.js";

import { Op } from "sequelize";
import jwt from "jsonwebtoken";

const showUser = async (req, res, next) => {
  /*
   the results depends on the auth state, so we create functions to handle it for both case
  */

  const processWithAuth = async (targetUserId = 0, authUserId = 0) => {
    const authUser = await User.findByPk(authUserId);

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
          required: false,
        },
      },
    });

    let result;

    /*
      we emulate friendResource by adding friendship between the targetUser and authUser
    */

    // friendship between targetUser and authUser
    const friendshipTargetAuthUser = await targetUser.getFriends({
      where: {
        id: authUserId,
      },
    });

    if (friendshipTargetAuthUser.length > 0) {
      // ! we add explicitly a new property, so DON'T save it
      targetUser.Friendship = friendshipTargetAuthUser[0].Friendship;
      result = friendResource(targetUser);
    } else {
      result = userResource(targetUser);

      result.friendship = {
        isFriend: false,
      };
    }

    // * we also emulate friendship between targetUser's friends and authUser (NOT between the targetUser and his friends)
    result.friends = targetUser.Friends.map((friend) => {
      let friendObject;

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
    });

    // find if a friendRequest exists between authUser and targetUser
    const friendRequest = await FriendRequest.findOne({
      include: ["Sender"],
      where: {
        [Op.or]: [
          {
            [Op.and]: [
              { receiverId: targetUser.id },
              { senderId: authUser.id },
            ],
          },
          {
            [Op.and]: [
              { receiverId: authUser.id },
              { senderId: targetUser.id },
            ],
          },
        ],
      },
    });

    // if it exists, that means they are not friends
    if (friendRequest) {
      result.friendRequest = friendRequestResource(friendRequest);
    } else {
      result.friendRequest = null;
    }

    return result;
  };

  const processWithoutAuth = async (targetUserId = 0) => {
    let result;

    const targetUser = await User.findByPk(targetUserId, {
      include: {
        association: "Friends",
      },
    });

    result = userResource(targetUser);
    // explicitly add a falsy friendship because the request is not authenticated
    result.friends = userCollection(targetUser.Friends).map((user) => {
      user.friendship = {
        isFriend: false,
      };

      return user;
    });
    result.friendRequest = null;
    result.friendship = {
      isFriend: false,
    };

    return result;
  };

  let isAuthenticated = false;
  const targetUserId = +req.params.userId;

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

    return res.json(
      createDataResponse({
        user: result,
      })
    );
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
          return res.json(
            createDataResponse({
              user: result,
            })
          );
        })
        .catch((error) => {
          next(error);
        });
    } else {
      next(error);
    }
  }
};

export { showUser };
