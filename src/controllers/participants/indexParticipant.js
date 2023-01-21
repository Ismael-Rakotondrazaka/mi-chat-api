import { User, Conversation } from "../../models/index.js";
import {
  participantCollection,
  userResource,
  friendResource,
  participationResource,
} from "../../resources/index.js";
import { isAuthorizedTo } from "../../policies/index.js";
import { createDataResponse } from "../../utils/responses/index.js";

const indexParticipant = async (req, res, next) => {
  try {
    const authUserId = req.payload.user.id;
    const authUser = await User.findByPk(authUserId);

    const targetConversationId = +req.params.conversationId;
    const targetConversation = await Conversation.findByPk(
      targetConversationId
    );

    const { order } = req.params;

    await isAuthorizedTo({
      user: authUser,
      action: "viewAny",
      source: "Participant",
      through: targetConversation,
    });

    let result = [];

    if (targetConversation.type === "personal") {
      const participantsFetched = await targetConversation.getParticipants();

      const converserId = participantsFetched.find(
        (participant) => participant.id !== authUserId
      ).id;

      const friendFetched = await authUser.getFriends({
        where: {
          id: converserId,
        },
      });

      // if they are not friends, they still participants, but need to send null as participations
      if (friendFetched.length === 1) {
        result = participantsFetched.map((participant) => {
          if (participant.id === converserId) {
            participant.Friendship = friendFetched[0].Friendship;
            return {
              ...friendResource(participant),
              participation: participationResource(
                participantsFetched.find((val) => val.id === participant.id)
                  .Participant
              ),
            };
          } else {
            return {
              ...userResource(participant),
              participation: participationResource(
                participantsFetched.find((val) => val.id === participant.id)
                  .Participant
              ),
              friendship: {
                isFriend: false,
              },
            };
          }
        });
      } else {
        result = participantsFetched.map((participant) => ({
          ...userResource(participant),
          participation: null,
          friendship: {
            isFriend: false,
          },
        }));
      }
    } else if (targetConversation.type === "group") {
      const isParticipant = await targetConversation.hasParticipant(authUser);

      if (isParticipant) {
        let participantParam = {
          include: [
            {
              association: "Friends",
              where: {
                id: authUser.id,
              },
              required: false,
            },
          ],
          order: [["firstName", order === "DESC" ? "DESC" : "ASC"]],
        };

        const participantsFetched = await targetConversation.getParticipants(
          participantParam
        );

        result = participantCollection(participantsFetched);
      } else {
        // authUser has been a member
        result = [];
      }
    }

    return res.json(
      createDataResponse({
        participants: result,
      })
    );
  } catch (error) {
    next(error);
  }
};

export { indexParticipant };
