import { senderResource } from "./senderResource.js";

const messageResource = (resource) => ({
  id: resource.id,
  conversationId: resource.conversationId,
  type: resource.type,
  content: resource.content,
  createdAt: resource.createdAt,
  sender: senderResource(resource.Sender),
});

export { messageResource };
