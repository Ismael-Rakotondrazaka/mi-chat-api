import { Conversation, Message, User } from "#models/index.js";
import { messageResource } from "#resources/index.js";
import { socketIO } from "#services/socketIO/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { BadRequestError } from "#utils/errors/index.js";
import { validateMessage } from "#utils/strings/index.js";
import { createDataResponse } from "#utils/responses/index.js";

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
      // TODO upload the file message
      throw new ServerError("Not implemented yet");
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

      // we add viewers to the message
      await targetMessageCreated.addViewers(targetConversation.Participants);

      const result = messageResource(targetMessage);

      const response = {
        message: result,
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
