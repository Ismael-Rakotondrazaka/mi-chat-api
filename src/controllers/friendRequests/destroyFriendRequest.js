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

    const response = createDataResponse({
      friendRequest: {
        id: targetFriendRequest.id,
      },
    });

    socketIO.to(receiver.channelId).emit("friendRequests:destroy", response);

    // and we also notify the requester, no matter if he is the sender or the receiver
    return res.json(response);
  } catch (error) {
    next(error);
  }
};

export { destroyFriendRequest };
