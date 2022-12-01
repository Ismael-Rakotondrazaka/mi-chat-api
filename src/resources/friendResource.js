import { userResource } from "./userResource.js";

const friendResource = (resource) => ({
  ...userResource(resource),
  friendship: {
    isFriend: true,
    conversationId: resource.Friendship.conversationId,
    createdAt: resource.Friendship.createdAt,
  },
});

export { friendResource };
