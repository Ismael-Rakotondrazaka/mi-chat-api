import { User, FriendRequest } from "#models/index.js";
import { isAuthorizedTo } from "#policies/index.js";

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

    // TODO notify the other user about the friendship destroyed
    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export { destroyFriendRequest };
