import { User, Conversation, GroupConversationLeft } from "../../models/index.js";
import { isAuthorizedTo } from "../../policies/index.js";
import { socketIO } from "../../services/socketIO/index.js";
import { createDataResponse } from "../../utils/responses/index.js";

const destroyParticipant = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetConversationId = +req.params.conversationId;
    const targetConversation = await Conversation.findByPk(
      targetConversationId
    );

    const targetParticipantId = +req.params.participantId;
    const targetParticipant = (
      await targetConversation.getParticipants({
        where: {
          id: targetParticipantId,
        },
      })
    ).at(0);

    await isAuthorizedTo({
      user: authUser,
      action: "destroy",
      source: "Participant",
      target: targetParticipant,
      through: targetConversation,
    });

    await targetConversation.removeParticipant(targetParticipant);

    targetConversation.changed("updatedAt", true);
    await targetConversation.update({
      updatedAt: new Date(),
    });

    await GroupConversationLeft.create({
      conversationId: targetConversation.id,
      userId: targetParticipant.id,
      name: targetConversation.name,
      description: targetConversation.description,
      imageUrl: targetConversation.imageUrl,
    });

    const response = {
      conversation: {
        id: targetConversationId,
        updatedAt: targetConversation.updatedAt,
        participants: [targetParticipantId],
      },
    };

    socketIO
      .to(targetParticipant.channelId)
      .emit("participants:destroy", createDataResponse(response));

    //! they still connected to the socket, so need to remove them later
    //! they will send an event to the server through the socket and we can remove them from the room
    socketIO
      .to(targetConversation.channelId)
      .emit("participants:destroy", createDataResponse(response));

    return res.json(createDataResponse(response));
  } catch (error) {
    next(error);
  }
};

export { destroyParticipant };
