import { User, FriendRequest } from "../../models/index.js";
import { friendRequestResource } from "../../resources/index.js";
import { BadRequestError, ConflictError } from "../../utils/errors/index.js";
import { createDataResponse } from "../../utils/responses/index.js";
import { socketIO } from "../../services/socketIO/index.js";

const storeFriendRequest = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    let { userId: targetUserId } = req.body;

    if (!targetUserId)
      throw new BadRequestError("Field 'userId' is required.", {
        code: "E2_19",
      });

    if (!/^\d+$/.test(targetUserId))
      throw new BadRequestError("Field 'userId' is in a bad format.", {
        code: "E2_20",
      });

    const targetUser = await User.findByPk(targetUserId);

    if (!targetUser)
      throw new BadRequestError(
        "The user with 'userId' as id does not exist.",
        {
          code: "E2_21",
        }
      );

    // trying to send FR to itself
    if (targetUser.id === authUser.id)
      throw new BadRequestError("Trying to send friend request to itself.", {
        code: "E4_2",
      });

    // if already friends
    if (await authUser.hasFriend(targetUser.id))
      throw new ConflictError("Trying to send friend request to a friend.", {
        code: "E4_3",
      });

    // if already has a friendRequest from the targetUser
    if (
      (
        await authUser.getFriendRequests({
          where: {
            senderId: targetUser.id,
          },
        })
      ).length !== 0
    )
      throw new ConflictError(
        "Already have a friend request from the target user.",
        {
          code: "E4_4",
        }
      );

    // if already sent a FR to the targetUser
    if (
      (
        await targetUser.getFriendRequests({
          where: {
            senderId: authUser.id,
          },
        })
      ).length !== 0
    )
      throw new ConflictError(
        "Already sent a friend request to the target user.",
        {
          code: "E4_5",
        }
      );

    const targetFriendRequest = await FriendRequest.create({
      senderId: authUser.id,
      receiverId: targetUser.id,
    });

    targetFriendRequest.Sender = authUser;
    const targetFriendRequestResource =
      friendRequestResource(targetFriendRequest);

    const response = createDataResponse({
      friendRequest: targetFriendRequestResource,
    });

    // we notify the target user about the new friend request
    socketIO.to(targetUser.channelId).emit("friendRequests:store", response);

    return res.json(response);
  } catch (error) {
    next(error);
  }
};

export { storeFriendRequest };
