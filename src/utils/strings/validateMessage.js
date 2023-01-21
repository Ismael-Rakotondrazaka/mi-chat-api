import { messageConfig } from "../../configs/index.js";
import { BadRequestError } from "../../utils/errors/index.js";

const validateMessage = (message) => {
  if (typeof message !== "string")
    throw new BadRequestError(
      "Field 'content' of message with type 'text' must be a string.",
      {
        code: "E2_42",
      }
    );

  const trimmed = message.trim();

  if (trimmed.length === 0)
    throw new BadRequestError(
      "Field 'content' of message cannot be an empty string.",
      {
        code: "E2_43",
      }
    );

  const maxMessageLength = messageConfig.MAX_MESSAGE_LENGTH;
  if (trimmed.length > maxMessageLength)
    throw new BadRequestError(
      `Invalid 'content' of message with type 'text'. ${maxMessageLength} characters long is the maximum allowed.`,
      {
        code: "E2_44",
      }
    );

  return trimmed;
};

export { validateMessage };
