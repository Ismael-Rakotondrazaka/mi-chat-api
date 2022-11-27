import { BadRequestError } from "#utils/errors/index.js";
import { userConfig } from "#configs/index.js";

const validateLastName = (lastName) => {
  if (typeof lastName !== "string")
    throw new BadRequestError("Field 'lastName' must be a string.", {
      code: "E2_11",
    });

  const trimmed = lastName.trim();

  const lastNameMaxLength = userConfig.MAX_LAST_NAME_LENGTH;

  if (lastName.length > lastNameMaxLength)
    throw new BadRequestError(
      `Invalid 'lastName'. ${lastNameMaxLength} characters long is the maximum allowed.`,
      {
        code: "E2_12",
      }
    );

  return trimmed;
};

export { validateLastName };
