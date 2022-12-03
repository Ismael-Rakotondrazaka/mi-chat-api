const participationResource = (resource) => ({
  nickname: resource.nickname,
  conversationId: resource.conversationId,
  role: resource.role,
  createdAt: resource.createdAt,
});

export { participationResource };
