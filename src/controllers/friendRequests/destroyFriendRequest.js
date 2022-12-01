import { User, FriendRequest } from "#models/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { socketIO } from "#services/socketIO/index.js";
import { createDataResponse } from "#utils/responses/index.js";

const destroyFriendRequest = async (req, res, next) => {
  try {
    // authUser can be the sender or the receiver
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);
    const friendRequestId = +req.params.friendRequestId;
    const targetFriendRequest = await FriendRequest.findByPk(friendRequestId);

    await isAuthorizedTo({
      user: authUser,
      action: "destroy",
      source: "FriendRequest",
      target: targetFriendRequest,
    });

    await targetFriendRequest.destroy();

    // notify the receiver user about the FR destroyed
    const receiver = await User.findByPk(targetFriendRequest.receiverId, {
      attributes: ["channelId"],
    });
    socketIO.to(receiver.channelId).emit(
      "friendRequests:destroy",
      createDataResponse({
        friendRequest: {
          id: targetFriendRequest.id,
        },
      })
    );

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export { destroyFriendRequest };
