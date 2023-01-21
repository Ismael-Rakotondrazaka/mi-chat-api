import {
  User,
  FriendRequest,
  Conversation,
  Friendship,
  Participant,
} from "../../models/index.js";
import { isAuthorizedTo } from "../../policies/index.js";
import { createDataResponse } from "../../utils/responses/index.js";
import { friendResource } from "../../resources/index.js";
import { socketIO } from "../../services/socketIO/index.js";
import { createRandomString } from "../../utils/strings/index.js";

import { Op } from "sequelize";

// updating the FR == accepting the FR
const updateFriendRequest = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);
    const friendRequestId = +req.params.friendRequestId;
    const targetFriendRequest = await FriendRequest.findByPk(friendRequestId);
    const targetUser = await User.findByPk(targetFriendRequest.senderId);

    await isAuthorizedTo({
      user: authUser,
      action: "update",
      source: "FriendRequest",
      target: targetFriendRequest,
    });

    await targetFriendRequest.destroy();

    /*
      we need to find an personal conversion
      if it doesn't exist, we create a new one
      otherwise, we reuse it
    */
    let targetConversationId = 0;

    let mutualConversationId = 0;

    const participantsFetched = await Participant.findAll({
      include: [
        {
          where: {
            [Op.and]: {
              "$Conversation.type$": "personal",
              "$Participant.user_id$": {
                [Op.in]: [authUser.id, targetUser.id],
              },
            },
          },
          association: "Conversation",
        },
      ],
      order: [["Conversation", "id", "ASC"]],
    });

    participantsFetched.forEach((participant, index, arr) => {
      if (
        arr[index]?.conversationId === arr[index - 1]?.conversationId &&
        arr[index - 1]?.conversationId !== undefined
      ) {
        mutualConversationId = arr[index]?.conversationId;
      }
    });

    let targetConversation;

    if (mutualConversationId !== 0) {
      // we reuse the conversation
      targetConversationId = mutualConversationId;
      targetConversation = participantsFetched.Conversation;
    } else {
      // we crate a new conversation
      targetConversation = await Conversation.create({
        type: "personal",
        channelId: createRandomString(),
      });

      await targetConversation.addParticipants([authUser, targetUser]);

      targetConversationId = targetConversation.id;
    }

    const authUserFriendship = await Friendship.create({
      // ! create db Constraint error when keys are in camelCase
      user_id: authUser.id,
      friend_id: targetUser.id,
      conversationId: targetConversationId,
    });

    const targetUserFriendship = await Friendship.create({
      // ! create db Constraint error when keys are in camelCase
      user_id: targetUser.id,
      friend_id: authUser.id,
      conversationId: targetConversationId,
    });

    // notify the authUser that the FR is destroyed
    socketIO.to(authUser.channelId).emit(
      "friendRequests:destroy",
      createDataResponse({
        friendRequest: {
          id: friendRequestId,
        },
      })
    );

    // send the targetUser infos to authUser
    // ! we add explicitly a new property, so DON'T save it
    targetUser.Friendship = targetUserFriendship;
    const authUserNewFriend = friendResource(targetUser);
    socketIO.to(authUser.channelId).emit(
      "friends:store",
      createDataResponse({
        user: authUserNewFriend,
      })
    );

    // notify the targetUser about his new friend (authUser)
    // ! we add explicitly a new property, so DON'T save it
    authUser.Friendship = authUserFriendship;
    const targetUserNewFriend = friendResource(authUser);
    socketIO.to(targetUser.channelId).emit(
      "friends:store",
      createDataResponse({
        user: targetUserNewFriend,
      })
    );

    // send the conversationId to both targetUser and authUser channels
    socketIO.to(authUser.channelId).emit(
      "conversations:store",
      createDataResponse({
        conversation: {
          id: targetConversationId,
        },
      })
    );
    socketIO.to(targetUser.channelId).emit(
      "conversations:store",
      createDataResponse({
        conversation: {
          id: targetConversationId,
        },
      })
    );

    /*
      since the informations about a conversation are huge,
      we prefer to send back only the conversationId
      the client need to fetch those informations in another request
      But we send the new friend of authUser
     */
    return res.json(
      createDataResponse({
        conversation: {
          id: targetConversationId,
        },
        user: authUserNewFriend,
      })
    );
  } catch (error) {
    next(error);
  }
};

export { updateFriendRequest };
