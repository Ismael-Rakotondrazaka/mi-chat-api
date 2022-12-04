import { participantResource } from "./participantResource.js";

const participantCollection = (collection) =>
  collection.map((resource) => participantResource(resource));

export { participantCollection };
