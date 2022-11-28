import { userResource } from "#resources/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { User } from "#models/index.js";
import { createDataResponse } from "#utils/responses/index.js";
import { validateDescription } from "#utils/strings/index.js";
import { BadRequestError } from "#utils/errors/index.js";

/* 
  description, profileImage can be updated
*/
const updateUser = async function (req, res, next) {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);
    const targetUserId = +req.params.userId;
    const targetUser = await User.findByPk(targetUserId);
    const { description } = req.body;
    const profileImage = req.file;

    const auth = await isAuthorizedTo({
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
      userParam.description = validateDescription(description) || null;
    }

    if (profileImage) {
      // TODO upload the file, then save updates
      throw new ServerError("not implemented yet.");
    } else if (changes.description) {
      await authUser.update(userParam);

      return res.json(
        createDataResponse({
          user: userResource(authUser),
        })
      );
    } else {
      throw new BadRequestError("No change found.", {
        code: "E2_18",
      });
    }
  } catch (error) {
    next(error);
  }
};

export { updateUser };
