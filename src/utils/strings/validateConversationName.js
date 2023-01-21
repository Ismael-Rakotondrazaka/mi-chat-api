import { conversationConfig } from "../../configs/index.js";
import { BadRequestError } from "../../utils/errors/index.js";

const validateConversationName = (groupName) => {
  if (typeof groupName !== "string")
    throw new BadRequestError("Field 'groupName' must be a string.", {
      code: "E2_33",
    });

  const trimmed = groupName.trim();

  if (trimmed.length === 0)
    throw new BadRequestError("Field 'groupName' is required.", {
      code: "E2_24",
    });

  if (groupName.length > conversationConfig.MAX_GROUP_NAME_LENGTH)
    throw new BadRequestError(
      `Invalid 'groupName'. ${conversationConfig.MAX_GROUP_NAME_LENGTH} long is the maximum allowed for group names.`,
      {
        code: "E2_40",
      }
    );

  return trimmed;
};

export { validateConversationName };
