import { User, Conversation, Viewer } from "#models/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { socketIO } from "#services/socketIO/index.js";
import { createDataResponse } from "#utils/responses/index.js";

import { Op } from "sequelize";

const destroyUnreadMessage = async (req, res, next) => {
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

    const targetViewsIdFetched = await Viewer.findAll({
      include: [
        {
          association: "Message",
          where: {
            conversationId: targetConversationId,
          },
          required: true,
          attributes: [],
        },
      ],
      where: {
        userId: authUserId,
        unread: true,
      },
      attributes: ["id"],
    });

    const targetViewsId = targetViewsIdFetched.map((view) => view.id);

    await Viewer.update(
      {
        unread: false,
      },
      {
        where: {
          id: {
            [Op.in]: targetViewsId,
          },
        },
      }
    );

    const response = {
      conversation: {
        id: targetConversationId,
        unreadMessagesCount: 0,
      },
    };

    socketIO
      .to(authUser.channelId)
      .emit("unreadMessages:destroy", createDataResponse(response));

    return res.json(createDataResponse(response));
  } catch (error) {
    next(error);
  }
};

export { destroyUnreadMessage };
