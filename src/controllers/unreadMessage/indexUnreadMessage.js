import { User, Conversation, Viewer } from "#models/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { createDataResponse } from "#utils/responses/index.js";

const indexUnreadMessage = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetConversationId = +req.params.conversationId;
    const targetConversation = await Conversation.findByPk(
      targetConversationId
    );

    await isAuthorizedTo({
      user: authUser,
      action: "viewAny",
      source: "UnreadMessage",
      through: targetConversation,
    });

    const result = await Viewer.count({
      include: [
        {
          association: "Message",
          where: {
            conversationId: targetConversationId,
          },
          required: true,
        },
      ],
      where: {
        userId: authUser.id,
        unread: true,
      },
    });

    const response = {
      conversation: {
        id: targetConversationId,
        unreadMessagesCount: result,
      },
    };

    return res.json(createDataResponse(response));
  } catch (error) {
    next(error);
  }
};

export { indexUnreadMessage };
