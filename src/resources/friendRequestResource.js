import { userResource } from "./userResource.js";

const friendRequestResource = (resource) => {
  const data = {
    id: resource.id,
    createdAt: resource.createdAt,
    receiverId: resource.receiverId,
    sender: userResource(resource.Sender),
  };
  return data;
};

export { friendRequestResource };
