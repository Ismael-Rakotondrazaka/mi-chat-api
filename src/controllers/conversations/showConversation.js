import {
  User,
  Conversation,
  Viewer,
  GroupConversationLeft,
} from "../../models/index.js";
import {
  messageResource,
  participationResource,
  conversationResource,
  userResource,
} from "../../resources/index.js";
import { createDataResponse } from "../../utils/responses/index.js";
import { isAuthorizedTo } from "../../policies/index.js";

import { Op } from "sequelize";

// some fields depend on the user who send request: latestMessage, unreadMessageCount
const showConversation = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const targetConversationId = +req.params.conversationId;

    const authUser = await User.findByPk(authUserId);

    const targetConversation = await Conversation.findByPk(
      targetConversationId
    );

    await isAuthorizedTo({
      user: authUser,
      action: "view",
      source: "Conversation",
      target: targetConversation,
    });

    let result = null;

    /*
      since the result depends on the states of the targetConversation,
      we create a function for each of them
    */

    const personalConversationHandler = async (
      authUser,
      targetConversation
    ) => {
      let targetConversationToExpose = conversationResource(targetConversation);

      const unreadMessagesCount = await Viewer.count({
        include: [
          {
            association: "Message",
            where: {
              conversationId: targetConversation.id,
            },
          },
        ],
        where: {
          [Op.and]: {
            userId: authUser.id,
            unread: true,
          },
        },
      });

      targetConversationToExpose.unreadMessagesCount = unreadMessagesCount;

      const participantsFetched = await targetConversation.getParticipants();

      const converserParticipantFetched = participantsFetched.find(
        (participant) => {
          return participant.id !== authUser.id;
        }
      );

      const authUserParticipantFetched = participantsFetched.find(
        (participant) => {
          return participant.id === authUser.id;
        }
      );

      let latestMessageFetched = await Viewer.findOne({
        include: [
          {
            association: "Message",
            where: {
              conversationId: targetConversation.id,
            },
            include: {
              association: "Sender",
              include: {
                where: {
                  conversationId: targetConversation.id,
                },
                association: "Participations",
                required: false,
              },
            },
          },
        ],
        where: {
          [Op.and]: {
            userId: authUser.id,
          },
        },
        order: [
          ["messageId", "DESC"],
          // * this one causes an error when used with limit or findOne
          // [Message, "createdAt", "ASC"],
        ],
      });
      if (latestMessageFetched) {
        latestMessageFetched = latestMessageFetched.Message;
      }

      let converserToExpose = userResource(converserParticipantFetched);

      let friendFetched = await authUser.getFriends({
        where: {
          id: converserParticipantFetched.id,
        },
      });

      friendFetched = friendFetched.length > 0 ? friendFetched[0] : null;

      if (friendFetched) {
        converserToExpose.friendship = {
          isFriend: true,
          conversationId: friendFetched.Friendship.conversationId,
          createdAt: friendFetched.Friendship.createdAt,
        };
        converserToExpose.participation = participationResource(
          converserParticipantFetched.Participant
        );
        targetConversationToExpose.participation = participationResource(
          authUserParticipantFetched.Participant
        );
      } else {
        converserToExpose.friendship = {
          isFriend: false,
        };
        converserToExpose.participation = null;
        targetConversationToExpose.participation = null;
      }

      targetConversationToExpose.converser = converserToExpose;

      if (latestMessageFetched) {
        targetConversationToExpose.latestMessage =
          messageResource(latestMessageFetched);
        if (!friendFetched) {
          targetConversationToExpose.latestMessage.sender.participation = null;
        }
      } else {
        targetConversationToExpose.latestMessage = null;
      }

      return targetConversationToExpose;
    };

    const activeGroupConversationHandler = async (
      authUser,
      targetConversation
    ) => {
      let targetConversationToExpose = conversationResource(targetConversation);

      const unreadMessagesCount = await Viewer.count({
        include: [
          {
            association: "Message",
            where: {
              conversationId: targetConversation.id,
            },
          },
        ],
        where: {
          [Op.and]: {
            userId: authUser.id,
            unread: true,
          },
        },
      });

      targetConversationToExpose.unreadMessagesCount = unreadMessagesCount;

      const authUserParticipantFetched = (
        await targetConversation.getParticipants({
          where: {
            id: authUser.id,
          },
        })
      )[0];

      targetConversationToExpose.participation = participationResource(
        authUserParticipantFetched.Participant
      );

      let latestMessageFetched = await Viewer.findOne({
        include: [
          {
            association: "Message",
            where: {
              conversationId: targetConversation.id,
            },
            include: {
              association: "Sender",
              include: {
                where: {
                  conversationId: targetConversation.id,
                },
                association: "Participations",
                required: false,
              },
            },
          },
        ],
        where: {
          [Op.and]: {
            userId: authUser.id,
          },
        },
        order: [
          ["messageId", "DESC"],
          // * this one causes an error when used with limit or findOne
          // [Message, "createdAt", "ASC"],
        ],
      });
      let latestMessageToExpose = null;

      if (latestMessageFetched) {
        latestMessageFetched = latestMessageFetched.Message;
        latestMessageToExpose = messageResource(latestMessageFetched);
      }

      targetConversationToExpose.latestMessage = latestMessageToExpose;

      return targetConversationToExpose;
    };

    const groupConversationLeftHandler = async (
      authUser,
      targetConversation
    ) => {
      let targetConversationLeft = await GroupConversationLeft.findOne({
        where: {
          [Op.and]: {
            conversationId: targetConversation.id,
            userId: authUser.id,
          },
        },
      });

      let targetConversationToExpose = conversationResource(
        targetConversationLeft
      );
      targetConversationToExpose.id = targetConversation.id;
      targetConversationToExpose.type = "group";

      const unreadMessagesCount = await Viewer.count({
        include: [
          {
            association: "Message",
            where: {
              conversationId: targetConversation.id,
            },
          },
        ],
        where: {
          [Op.and]: {
            userId: authUser.id,
            unread: true,
          },
        },
      });

      targetConversationToExpose.unreadMessagesCount = unreadMessagesCount;

      let latestMessageFetched = await Viewer.findOne({
        include: [
          {
            association: "Message",
            where: {
              conversationId: targetConversation.id,
            },
            include: {
              association: "Sender",
            },
          },
        ],
        where: {
          [Op.and]: {
            userId: authUser.id,
            "$Message.createdAt$": {
              [Op.lte]: targetConversationLeft.createdAt,
            },
          },
        },
        order: [
          ["messageId", "DESC"],
          // * this one causes an error when used with limit or findOne
          // [Message, "createdAt", "ASC"],
        ],
      });

      let latestMessageToExpose = null;

      if (latestMessageFetched) {
        latestMessageFetched = latestMessageFetched.Message;
        latestMessageToExpose = messageResource(latestMessageFetched);
        const sender = userResource(latestMessageFetched.Sender);
        sender.participation = null;
        latestMessageToExpose.sender = sender;
      }

      targetConversationToExpose.latestMessage = latestMessageToExpose;
      targetConversationToExpose.participation = null;
      return targetConversationToExpose;
    };

    if (targetConversation.type === "personal") {
      result = await personalConversationHandler(authUser, targetConversation);
    } else if (targetConversation.type === "group") {
      const isParticipant = await targetConversation.hasParticipant(authUser);
      if (isParticipant) {
        result = await activeGroupConversationHandler(
          authUser,
          targetConversation
        );
      } else {
        result = await groupConversationLeftHandler(
          authUser,
          targetConversation
        );
      }
    }

    return res.json(
      createDataResponse({
        conversation: result,
      })
    );
  } catch (error) {
    next(error);
  }
};

export { showConversation };
