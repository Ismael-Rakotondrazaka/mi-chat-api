const userResource = (resource) => {
  return {
    id: resource.id,
    name: {
      full: resource.fullName,
      first: resource.firstName,
      last: resource.lastName,
    },
    imageUrl: resource.imageUrl,
    description: resource.description,
    createdAt: resource.createdAt,
  };
};

export { userResource };
