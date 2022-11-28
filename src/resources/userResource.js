const userResource = (resource) => {
  return {
    id: resource.id,
    name: {
      full: resource.fullName,
      first: resource.firstName,
      last: resource.lastName,
    },
    email: resource.email,
    imageUrl: resource.imageUrl,
    description: resource.description,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  };
};

export { userResource };
