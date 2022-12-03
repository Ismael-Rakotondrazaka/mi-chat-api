import { userResource } from "./userResource.js";
import { participationResource } from "./participationResource.js";

const senderResource = (resource) => {
  let data = userResource(resource);
  if (resource?.Participations?.length > 0) {
    data.participation = participationResource(resource.Participations.at(0));
  } else {
    data.participation = null;
  }
  return data;
};

export { senderResource };
