import { User } from "#models/index.js";
import { socketIO } from "#services/socketIO/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { createDataResponse } from "#utils/responses/index.js";

const destroyFriend = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    let targetUserId = +req.params.userId;
    const targetUser = await User.findByPk(targetUserId);

    await isAuthorizedTo({
      user: authUser,
      action: "destroy",
      source: "Friend",
      target: targetUser,
    });

    await authUser.removeFriend(targetUser);
    await targetUser.removeFriend(authUser);

    // we notify both targetUser and authUser
    socketIO.to(authUser.channelId).emit(
      "friends:destroy",
      createDataResponse({
        user: {
          id: targetUser.id,
        },
      })
    );
    socketIO.to(targetUser.channelId).emit(
      "friends:destroy",
      createDataResponse({
        user: {
          id: authUser.id,
        },
      })
    );

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export { destroyFriend };
