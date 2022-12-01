import { friendResource } from "./friendResource.js";

const friendCollection = (collection) =>
  collection.map((resource) => friendResource(resource));

export { friendCollection };
