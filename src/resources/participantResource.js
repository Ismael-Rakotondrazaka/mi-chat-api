import { userResource } from "./userResource.js";
import { participationResource } from "./participationResource.js";

const participantResource = (resource) => {
  let data = {
    ...userResource(resource),
    participation: participationResource(resource.Participant),
  };

  if (resource?.Friends?.length === 1) {
    data.friendship = {
      isFriend: true,
      conversationId: resource.Friends[0].Friendship.conversationId,
      createdAt: resource.Friends[0].Friendship.createdAt,
    };
  } else {
    data.friendship = {
      isFriend: false,
    };
  }

  return data;
};

export { participantResource };
