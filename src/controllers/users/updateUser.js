import { userResource } from "#resources/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { User } from "#models/index.js";
import { createDataResponse } from "#utils/responses/index.js";
import { validateDescription, createFilename } from "#utils/strings/index.js";
import { BadRequestError } from "#utils/errors/index.js";
import { socketIO } from "#services/socketIO/index.js";
import { uploadFile } from "#services/GCS/index.js";

/* 
  description, profileImage can be updated
*/
const updateUser = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);
    const targetUserId = +req.params.userId;
    const targetUser = await User.findByPk(targetUserId);
    const { description } = req.body;
    const profileImage = req.file;

    await isAuthorizedTo({
      source: "User",
      action: "update",
      user: authUser,
      target: targetUser,
    });

    let changes = {
      description: false,
      profileImage: false,
    };

    let userParam = {};

    if (
      typeof description === "string" &&
      ((description.trim() === "" && authUser.description !== null) ||
        (description.trim() !== "" &&
          description.trim() !== authUser.description))
    ) {
      changes.description = true;
      userParam.description = description
        ? validateDescription(description)
        : null;
    }

    if (profileImage && profileImage !== authUser.imageUrl) {
      changes.profileImage = true;
    }

    if (!Object.values(changes).some((val) => val === true))
      throw new BadRequestError("No change found.", {
        code: "E2_18",
      });

    if (profileImage) {
      const mimetype = profileImage.mimetype;
      const originalName = profileImage.originalname;
      const filename = createFilename(originalName, mimetype);
      const imageUrl = `/users/${targetUser.id}/files/${filename}`;
      const destination = `public/users/${targetUser.id}/${filename}`;

      userParam.imageUrl = imageUrl;

      uploadFile(profileImage.buffer, {
        destination,
        contentType: mimetype,
        onFinish: async () => {
          await authUser.update(userParam);

          const response = createDataResponse({
            user: userResource(authUser),
          });

          // send the update to the channel of authUser
          socketIO.to(authUser.channelId).emit("users:update", response);

          // also send the update to the one who made the request
          return res.json(response);
        },
        onError: (err) => next(err),
        isPrivate: false,
      });
    } else {
      await authUser.update(userParam);

      const response = createDataResponse({
        user: userResource(authUser),
      });

      // send the update to the channel of authUser
      socketIO.to(authUser.channelId).emit("users:update", response);

      // also send the update to the one who made the request
      return res.json(response);
    }
  } catch (error) {
    next(error);
  }
};

export { updateUser };
