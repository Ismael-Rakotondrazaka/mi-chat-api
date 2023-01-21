import { User, Conversation } from "../../models/index.js";
import { conversationResource } from "../../resources/index.js";
import { BadRequestError, ServerError } from "../../utils/errors/index.js";
import { isAuthorizedTo } from "../../policies/index.js";
import {
  validateConversationDescription,
  validateConversationName,
  createFilename,
} from "../../utils/strings/index.js";
import { socketIO } from "../../services/socketIO/index.js";
import { createDataResponse } from "../../utils/responses/index.js";
import { uploadFile } from "../../services/GCS/index.js";

/**
 * update a group conversation, only the admin can do that
 * description, image, groupName can be updated
 * if the don't need to change a property, he should upload it without changing it
 */
const updateConversation = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetConversationId = +req.params.conversationId;

    let targetConversation = await Conversation.findByPk(targetConversationId);

    await isAuthorizedTo({
      user: authUser,
      action: "update",
      source: "Conversation",
      target: targetConversation,
    });

    let { groupName, description, profileImage: profileImageText } = req.body;
    const profileImage = req.file;

    const changes = {
      groupName: false,
      description: false,
      profileImage: false,
    };

    let conversationParams = {};

    if (!groupName) {
      throw new BadRequestError("Field 'groupName' is required.", {
        code: "E2_24",
      });
    }
    groupName = validateConversationName(groupName);
    if (groupName !== targetConversation.name) {
      changes.groupName = true;
      conversationParams.name = groupName;
    }

    // returns validated description or null or throw error
    description = validateConversationDescription(description || "");
    if (description !== targetConversation.description) {
      changes.description = true;
      conversationParams.description = description;
    }

    if (profileImage) {
      changes.profileImage = true;
    }

    if (Object.values(changes).every((val) => val === false))
      throw new BadRequestError("No change found.", {
        code: "E2_18",
      });

    if (changes.profileImage) {
      const mimetype = profileImage.mimetype;
      const originalName = profileImage.originalname;
      const filename = createFilename(originalName, mimetype);
      const imageUrl = `/conversations/${targetConversation.id}/files/${filename}`;
      const destination = `private/conversations/${targetConversation.id}/${filename}`;

      conversationParams.imageUrl = imageUrl;

      uploadFile(profileImage.buffer, {
        destination,
        contentType: mimetype,
        onFinish: async () => {
          await targetConversation.update(conversationParams);

          const response = createDataResponse({
            conversation: conversationResource(targetConversation),
          });

          socketIO
            .to(targetConversation.channelId)
            .emit("conversations:update", response);

          return res.json(response);
        },
        onError: (err) => next(err),
      });
    } else {
      await targetConversation.update(conversationParams);

      const response = createDataResponse({
        conversation: conversationResource(targetConversation),
      });

      socketIO
        .to(targetConversation.channelId)
        .emit("conversations:update", response);

      return res.json(response);
    }
  } catch (error) {
    next(error);
  }
};

export { updateConversation };
