import { conversationConfig } from "#configs/index.js";
import { BadRequestError } from "#utils/errors/index.js";

const validateConversationDescription = (description) => {
  if (typeof description !== "string")
    throw new BadRequestError(
      "Field 'description' (of conversation) must be a string.",
      {
        code: "E2_31",
      }
    );

  const trimmed = description.trim();

  const descriptionMaxLength = conversationConfig.MAX_DESCRIPTION_LENGTH;

  if (trimmed.length > descriptionMaxLength)
    throw new BadRequestError(
      `Invalid 'description'. ${descriptionMaxLength} characters long is the maximum allowed for conversation's description.`,
      {
        code: "E2_32",
      }
    );

  // because description is not required, it can be null if it is empty
  return trimmed.length !== 0 ? trimmed : null;
};

export { validateConversationDescription };
