import { getSignedUrl } from "#services/GCS/index.js";
import { User, Conversation } from "#models/index.js";
import { isAuthorizedTo } from "#policies/index.js";

import { contentType } from "mime-types";

const showConversationFile = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetConversationId = +req.params.conversationId;
    const targetConversation = await Conversation.findByPk(
      targetConversationId
    );

    await isAuthorizedTo({
      user: authUser,
      action: "view",
      source: "Conversation",
      target: targetConversation,
    });

    const filename = req.params.filename;
    const filetype = contentType(filename) || "application/octet-stream";

    const options = {
      action: "read",
    };

    const SHOWABLE = ["image", "video"];

    if (!SHOWABLE.includes(filetype.split("/")[0])) {
      options.responseDisposition = `attachment; filename="${filename}"`;
    }

    const files = await getSignedUrl(
      `private/conversations/${targetConversationId}/${filename}`,
      options
    );

    return res.redirect(files[0]);
  } catch (error) {
    next(error);
  }
};

export { showConversationFile };
