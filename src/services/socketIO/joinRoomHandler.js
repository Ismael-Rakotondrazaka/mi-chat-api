import { Conversation, User } from "../../models/index.js";
import { isAuthorizedTo } from "../../policies/index.js";
import { BadRequestError } from "../../utils/errors/index.js";

const joinRoomHandler = async (socketIO, socket, payload) => {
  try {
    const authUserId = socket.request.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const { conversationId } = payload;

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
      targetConversationId
    );

    if (!targetConversation)
      throw new BadRequestError(
        "The conversation with 'conversationId' as id does not exist.",
        {
          code: "E2_47",
        }
      );

    await isAuthorizedTo({
      user: authUser,
      action: "view",
      source: "Conversation",
      target: targetConversation,
    });

    if (!socket.rooms.has(targetConversation.channelId)) {
      socket.join(targetConversation.channelId);
    }
  } catch (error) {
    // TODO add error handler for socket
  }
};

export { joinRoomHandler };
