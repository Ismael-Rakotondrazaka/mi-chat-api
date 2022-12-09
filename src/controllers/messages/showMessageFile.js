import { Conversation, User, Message } from "#models/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { getSignedUrl } from "#services/GCS/index.js";

import { contentType } from "mime-types";

/*
    this function return messages relative to the one who request it,
    so, two users can have different result:
      - maybe he left the group
      - maybe he delete some messages
  */
const showMessageFile = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetConversationId = +req.params.conversationId;
    const targetConversation = await Conversation.findByPk(
      targetConversationId
    );

    const targetMessageId = +req.params.messageId;
    const targetMessage = await Message.findByPk(targetMessageId);

    await isAuthorizedTo({
      user: authUser,
      action: "view",
      source: "Message",
      through: targetConversation,
      target: targetMessage,
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
      `private/conversations/${targetConversationId}/messages/${filename}`,
      options
    );

    return res.redirect(files[0]);
  } catch (error) {
    next(error);
  }
};

export { showMessageFile };
