import { BadRequestError } from "#utils/errors/index.js";
import { userConfig } from "#configs/index.js";

const validateFirstName = (firstName) => {
  if (typeof firstName !== "string")
    throw new BadRequestError("Field 'firstName' must be a string.", {
      code: "E2_8",
    });

  const trimmed = firstName.trim();

  const firstNameMaxLength = userConfig.MAX_FIRST_NAME_LENGTH;

  if (firstName.length > firstNameMaxLength)
    throw new BadRequestError(
      `Invalid 'firstName'. ${firstNameMaxLength} characters long is the maximum allowed.`,
      {
        code: "E2_9",
      }
    );

  return trimmed;
};

export { validateFirstName };
