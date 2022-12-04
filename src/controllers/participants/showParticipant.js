import { User, Conversation } from "#models/index.js";
import { participantCollection } from "#resources/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { createDataResponse } from "#utils/responses/index.js";

const showParticipant = async (req, res, next) => {
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
    )[0];

    await isAuthorizedTo({
      user: authUser,
      action: "view",
      source: "Participant",
      target: targetParticipant,
      through: targetConversation,
    });

    const result = await targetConversation.getParticipants({
      where: {
        id: targetParticipant.id,
      },
      include: [
        {
          association: "Friends",
          where: {
            id: authUser.id,
          },
          required: false,
        },
      ],
    });

    return res.json(
      createDataResponse({
        participant: participantCollection(result)[0] || [],
      })
    );
  } catch (error) {
    next(error);
  }
};

export { showParticipant };
