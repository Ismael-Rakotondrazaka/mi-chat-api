import { User, Conversation } from "#models/index.js";

const joinDefaultRooms = async (socketIO, socket) => {
  const authUserId = socket.request.payload.user.id;

  const authUser = await User.findByPk(authUserId);

  socket.join(authUser.channelId);

  try {
    const targetConversationsIds = await Conversation.findAll({
      attributes: ["id", "channelId"],
      include: [
        {
          attributes: [],
          association: "Participants",
          where: {
            id: authUserId,
          },
          required: true,
        },
      ],
    });

    targetConversationsIds.forEach((value) => {
      socket.join(value.channelId);
    });
  } catch (error) {
    // TODO add error handler for socket
  }
};

export { joinDefaultRooms };
