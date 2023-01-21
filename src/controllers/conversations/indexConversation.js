import {
  User,
  Viewer,
  Conversation,
  GroupConversationLeft,
} from "#models/index.js";
import {
  conversationResource,
  messageResource,
  participationResource,
  userResource,
} from "#resources/index.js";
import { createDataResponse } from "#utils/responses/index.js";

import { Op } from "sequelize";

// ! Danger, RIP WITH EAGER LOADING
const indexConversation = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    // TODO implement other queries
    let { limit, order, type, like } = req.query;

    /*
      contains all the conversations where the user is a participant (or admin)
      it is easy to get them, so we start with it
    */
    let activeConversations = [];
    let activeConversationParams = {};

    // TODO add like query for groupConversationsLeft
    if (like) {
      const likeTrimmed = (like + "").trim();

      activeConversationParams = {
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                {
                  type: "personal",
                },
                {
                  [Op.or]: [
                    {
                      "$Participants.first_name$": {
                        [Op.substring]: likeTrimmed,
                      },
                    },
                    {
                      "$Participants.last_name$": {
                        [Op.substring]: likeTrimmed,
                      },
                    },
                  ],
                },
              ],
            },
            {
              [Op.and]: [
                {
                  type: "group",
                },
                {
                  name: {
                    [Op.substring]: likeTrimmed,
                  },
                },
              ],
            },
          ],
        },
        include: [
          {
            association: "Participants",
          },
        ],
      };
    }

    activeConversations = (
      await authUser.getConversations(activeConversationParams)
    ).map((conversation) => {
      return {
        ...conversationResource(conversation),
        participation: participationResource(conversation.Participant),
      };
    });

    /*
      for active conversations, there are 2 cases:
      - personal: we need to get:
            the converser, their participations,
            relationships between them and authUser, the latest message
      - group: we need to get:
            the latestMessage
    */

    let activeConversationsId = [];
    let personalConversationsId = [];
    let personalConversationsIndex = [];

    activeConversations.forEach((conversation, index) => {
      activeConversationsId.push(conversation.id);
      if (conversation.type === "personal") {
        personalConversationsId.push(conversation.id);
        personalConversationsIndex.push(index);
      }
    });

    // here, we get conversers and their participation
    let conversersId = [];
    let conversers = (
      await Conversation.findAll({
        where: {
          [Op.and]: {
            id: {
              [Op.in]: personalConversationsId,
            },
            "$Participants.id$": {
              [Op.ne]: authUser.id,
            },
          },
        },
        include: [
          {
            association: "Participants",
            required: false,
          },
        ],
      })
    ).map((converser) => {
      conversersId.push(converser.Participants[0].id);
      return {
        ...userResource(converser.Participants[0]),
        Participant: converser.Participants[0].Participant, // * used later
      };
    });

    // here we setup the relationship between authUser and conversers
    const friends = await authUser.getFriends({
      where: {
        id: {
          [Op.in]: conversersId,
        },
      },
    });

    conversers = conversers.map((converser) => {
      const friend = friends.find((friend) => friend.id === converser.id);

      let newValue = converser;

      if (friend) {
        newValue.friendship = {
          isFriend: true,
          conversationId: friend.Friendship.conversationId,
          createdAt: friend.Friendship.createdAt,
        };

        newValue.participation = participationResource(converser.Participant);
      } else {
        newValue.friendship = {
          isFriend: false,
        };

        newValue.participation = null;
      }

      delete converser.Participant; // * we delete because we have done with it

      return newValue;
    });

    personalConversationsIndex.forEach((indexValue, index) => {
      let newValue = activeConversations[indexValue];
      newValue.converser = conversers[index];
      if (!conversers[index].friendship.isFriend) {
        newValue.participation = null;
      }
      return newValue;
    });

    // we the latest message of each conversation
    const latestMessages = await Promise.allSettled(
      activeConversationsId.map(async (id) => {
        const viewerFetched = await Viewer.findOne({
          include: [
            {
              association: "Message",
              where: {
                conversationId: id,
              },
              include: {
                association: "Sender",
                include: {
                  where: {
                    conversationId: id,
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
        return viewerFetched;
      })
    );

    const activeConversationMessages = latestMessages.map((promiseResult) => {
      if (
        promiseResult.status === "rejected" ||
        (promiseResult.status === "fulfilled" && promiseResult.value === null)
      ) {
        return null;
      } else {
        return messageResource(promiseResult.value.Message);
      }
    });

    /* 
      then, we store the active conversations result in this variables
    */
    const finalActiveConversations = activeConversationsId.map((id, index) => {
      return {
        ...activeConversations[index],
        latestMessage: activeConversationMessages[index],
      };
    });

    /* 
      the next thing to do is to get conversations where auth User HAS BEEN a member
    */
    let groupConversationsLeft = await GroupConversationLeft.findAll({
      where: {
        userId: authUser.id,
      },
    });

    groupConversationsLeft = groupConversationsLeft.map((conversation) => {
      let result = conversationResource(conversation);
      result.id = conversation.conversationId;
      result.participation = null;
      // ! add some property that a conversation have but missing in a groupConversationsLeft, like channelId, type
      result.type = "group";
      return result;
    });

    const groupConversationsLeftId = groupConversationsLeft.map(
      (conversation) => {
        return conversation.id;
      }
    );

    const groupConversationsLatestMessages = await Promise.allSettled(
      groupConversationsLeftId.map(async (id, index) => {
        const result = await Viewer.findOne({
          include: [
            {
              association: "Message",
              where: {
                [Op.and]: {
                  conversationId: id,
                },
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
                [Op.lte]: groupConversationsLeft[index].createdAt,
              },
            },
          },
          order: [
            ["messageId", "DESC"],
            // * this one causes an error when used with limit or findOne
            // [Message, "createdAt", "ASC"],
          ],
        });
        return result;
      })
    );

    const groupConversationsMessages = groupConversationsLatestMessages.map(
      (promiseResult) => {
        if (
          promiseResult.status === "rejected" ||
          (promiseResult.status === "fulfilled" && promiseResult.value === null)
        ) {
          return null;
        } else {
          return messageResource(promiseResult.value.Message);
        }
      }
    );

    const finalGroupConversationsLeft = groupConversationsLeftId.map(
      (id, index) => {
        return {
          ...groupConversationsLeft[index],
          latestMessage: groupConversationsMessages[index],
        };
      }
    );

    let finalResult = finalActiveConversations.concat(
      finalGroupConversationsLeft
    );

    const finalConversationsId = activeConversationsId.concat(
      groupConversationsLeftId
    );

    //  find the unread message count of each conversation
    const unreadMessagesPromises = await Promise.allSettled(
      finalConversationsId.map(async (conversationId) => {
        const countFetched = await Viewer.count({
          include: [
            {
              association: "Message",
              where: {
                conversationId: conversationId,
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
        return countFetched;
      })
    );

    finalResult = finalResult.map((conversation, index) => {
      return {
        ...conversation,
        unreadMessagesCount:
          unreadMessagesPromises[index].status === "fulfilled"
            ? unreadMessagesPromises[index].value
            : 0,
      };
    });

    finalResult.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.json(
      createDataResponse({
        conversations: finalResult,
      })
    );
  } catch (error) {
    next(error);
  }
};

export { indexConversation };
