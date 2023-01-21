import { Conversation, Message, User } from "#models/index.js";
import { messageResource } from "#resources/index.js";
import { socketIO } from "#services/socketIO/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { BadRequestError } from "#utils/errors/index.js";
import { validateMessage, createFilename } from "#utils/strings/index.js";
import { createDataResponse } from "#utils/responses/index.js";
import { uploadFile } from "#services/GCS/index.js";
import { fileConfig } from "#configs/index.js";

const storeMessage = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetConversationId = +req.params.conversationId;
    const targetConversation = await Conversation.findByPk(
      targetConversationId,
      {
        include: [
          {
            association: "Participants", // we need the participants later
          },
        ],
      }
    );

    await isAuthorizedTo({
      user: authUser,
      action: "store",
      source: "Message",
      through: targetConversation,
    });

    let content = req.body.content;
    let contentFile = req.file;

    let messageType = null;
    let messageContent = null;

    if (!(content || contentFile))
      throw new BadRequestError("Message must have a 'content'.", {
        code: "E2_41",
      });

    if (contentFile) {
      /* 
        we create the message with a temp content
        then we upload the file, because we need the id of the message while precessing it
        and we update the content of the message
      */
      const mimetype = contentFile.mimetype;
      const originalName = contentFile.originalname;
      const filename = createFilename(originalName, mimetype);
      const destination = `private/conversations/${targetConversationId}/messages/${filename}`;

      let messageType = mimetype.split("/")[0];
      const SHOWABLE_FILETYPE = ["image", "video"];
      if (!SHOWABLE_FILETYPE.includes(messageType)) {
        messageType = "file";
      }
      // we use a temp content
      const FILETYPE_DEFAULT_URL = {
        image: fileConfig.COULD_NOT_LOAD_IMAGE_URL,
        video: fileConfig.COULD_NOT_LOAD_VIDEO_URL,
      };
      const tempContent =
        FILETYPE_DEFAULT_URL[messageType] || fileConfig.COULD_NOT_LOAD_FILE_URL;

      const messageParams = {
        conversationId: targetConversationId,
        content: tempContent,
        senderId: authUserId,
        type: messageType,
      };

      const targetMessageCreated = await Message.create(messageParams);

      const content = `/conversations/${targetConversationId}/messages/${targetMessageCreated.id}/files/${filename}`;

      uploadFile(contentFile.buffer, {
        destination,
        contentType: mimetype,
        onFinish: async () => {
          // re-fetch the message because we need the participation of the sender
          let targetMessage = await Message.findByPk(targetMessageCreated.id, {
            include: [
              {
                association: "Sender",
                include: [
                  {
                    where: {
                      conversationId: targetConversationId,
                    },
                    association: "Participations",
                  },
                ],
              },
            ],
          });

          await targetMessage.update({
            content: content,
          });

          targetConversation.changed("updatedAt", true);
          await targetConversation.update({
            updatedAt: new Date(),
          });

          // we add viewers to the message
          await targetMessageCreated.addViewers(
            targetConversation.Participants
          );

          const result = messageResource(targetMessage);

          const response = {
            conversation: {
              id: targetConversationId,
              updatedAt: targetConversation.updatedAt,
              message: result,
            },
          };

          socketIO
            .to(targetConversation.channelId)
            .emit("messages:store", createDataResponse(response));

          res.json(createDataResponse(response));
        },
        onError: (err) => next(err),
      });
    } else {
      content = validateMessage(content);

      messageContent = content;
      messageType = "text";

      const targetMessageCreated = await Message.create({
        conversationId: targetConversationId,
        content: messageContent,
        senderId: authUserId,
        type: messageType,
      });

      // re-fetch the message because we need the participation of the sender
      let targetMessage = await Message.findByPk(targetMessageCreated.id, {
        include: [
          {
            association: "Sender",
            include: [
              {
                where: {
                  conversationId: targetConversationId,
                },
                association: "Participations",
              },
            ],
          },
        ],
      });

      targetConversation.changed("updatedAt", true);
      await targetConversation.update({
        updatedAt: new Date(),
      });

      // we add viewers to the message
      await targetMessageCreated.addViewers(targetConversation.Participants);

      const result = messageResource(targetMessage);

      const response = {
        conversation: {
          id: targetConversationId,
          updatedAt: targetConversation.updatedAt,
          message: result,
        },
      };

      socketIO
        .to(targetConversation.channelId)
        .emit("messages:store", createDataResponse(response));

      return res.json(createDataResponse(response));
    }
  } catch (error) {
    next(error);
  }
};

export { storeMessage };
