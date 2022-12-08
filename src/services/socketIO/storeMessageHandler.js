import { Conversation, User, Message } from "#models/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { messageResource } from "#resources/index.js";
import { messageConfig } from "#configs/index.js";
import { BadRequestError } from "#utils/errors/index.js";
import { createDataResponse } from "#utils/responses/index.js";

const storeMessageHandler = async (socketIO, socket, payload) => {
  try {
    const authUserId = socket.request.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    let { conversationId, content } = payload;

    if (!conversationId)
      throw new BadRequestError("Field 'conversationId' is required.", {
        code: "E2_45",
      });

    if (!/^\d+$/.test(conversationId))
      throw new BadRequestError("Field 'conversationId' is in a bad format.", {
        code: "E2_46",
      });

    const targetConversationId = +conversationId;
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

    if (!content)
      throw new BadRequestError("Message must have a 'content'.", {
        code: "E2_41",
      });

    if (typeof content !== "string")
      throw new BadRequestError(
        "Field 'content' of message with type 'text' must be a string.",
        {
          code: "E2_42",
        }
      );

    const trimmed = content.trim();

    if (trimmed.length === 0)
      throw new BadRequestError(
        "Field 'content' of message cannot be an empty string.",
        {
          code: "E2_43",
        }
      );

    const maxMessageLength = messageConfig.MAX_MESSAGE_LENGTH;
    if (trimmed.length > maxMessageLength)
      throw new BadRequestError(
        `Invalid 'content' of message with type 'text'. ${maxMessageLength} characters long is the maximum allowed.`,
        {
          code: "E2_44",
        }
      );

    content = trimmed;

    const targetMessageCreated = await Message.create({
      conversationId: targetConversationId,
      content: content,
      senderId: authUserId,
      type: "text",
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
  } catch (error) {
    // TODO: add error handler for socket
  }
};

export { storeMessageHandler };
