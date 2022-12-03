const conversationResource = (resource) => ({
  id: resource.id,
  type: resource.type,
  channelId: resource.channelId,
  name: resource.name,
  imageUrl: resource.imageUrl,
  description: resource.description,
  updatedAt: resource.updatedAt,
  createdAt: resource.createdAt,
});

export { conversationResource };
