import { userResource } from "./userResource.js";

const userCollection = (collection) =>
  collection.map((resource) => userResource(resource));

export { userCollection };
