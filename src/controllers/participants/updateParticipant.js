import { User, Conversation, Participant } from "#models/index.js";
import { validateNickname } from "#utils/strings/index.js";
import { isAuthorizedTo } from "#policies/index.js";
import { socketIO } from "#services/socketIO/index.js";
import { BadRequestError } from "#utils/errors/index.js";
import { createDataResponse } from "#utils/responses/index.js";

/*
  if conversation is personal,
    - only nickname can be updated
  if conversation is group,
    - nickname and role can be updated
    - and role can be promoted only to admin
*/
const updateParticipant = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetConversationId = +req.params.conversationId;
    const targetConversation = await Conversation.findByPk(
      targetConversationId
    );

    const targetParticipantId = +req.params.participantId;
    const targetUser = await User.findByPk(targetParticipantId);

    const targetParticipant = await Participant.findOne({
      where: {
        userId: targetParticipantId,
        conversationId: targetConversationId,
      },
    });

    let { nickname, role } = req.body;

    await isAuthorizedTo({
      user: authUser,
      action: "update",
      source: "Participant",
      target: targetUser,
      through: targetConversation,
    });

    const changes = {
      nickname: false,
      role: false,
    };

    let participantParams = {};

    nickname = validateNickname(nickname || "");
    if (nickname !== targetParticipant.nickname) {
      changes.nickname = true;
      participantParams.nickname = nickname;
    }

    // role is required only when the conversation is a group
    if (targetConversation.type === "group") {
      if (!role)
        throw new BadRequestError("Field 'role' is required.", {
          code: "E2_36",
        });

      if (!["participant", "admin"].includes(role))
        throw new BadRequestError(
          "Field 'role' can only be 'participant' or 'admin'.",
          {
            code: "E2_37",
          }
        );

      if (targetParticipant.role === "admin" && role === "participant")
        throw new BadRequestError(
          "A participant with role 'admin' can not be downgraded to 'participant'.",
          {
            code: "E2_38",
          }
        );

      if (targetParticipant.role !== role) {
        changes.role = true;
        participantParams.role = role;
      }
    }

    if (!Object.values(changes).some((val) => val === true))
      throw new BadRequestError("No change found.", {
        code: "E2_18",
      });

    await targetParticipant.update(participantParams);

    /*
    because we don't know the friendship of the targetParticipant and users who listen the channel,
    we just send the conversationId, and the participantId
    the receiver will fetch them if needed
    */
    const response = {
      conversation: {
        id: targetConversationId,
        participants: [targetParticipantId],
      },
    };

    socketIO
      .to(targetConversation.channelId)
      .emit("participants:update", createDataResponse(response));

    return res.json(createDataResponse(response));
  } catch (error) {
    next(error);
  }
};

export { updateParticipant };
