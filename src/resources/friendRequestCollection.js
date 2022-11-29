import { friendRequestResource } from "./friendRequestResource.js";

const friendRequestCollection = (collection) =>
  collection.map((resource) => friendRequestResource(resource));

export { friendRequestCollection };
