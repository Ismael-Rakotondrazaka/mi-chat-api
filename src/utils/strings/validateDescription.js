import { BadRequestError } from "#utils/errors/index.js";
import { userConfig } from "#configs/index.js";

const validateDescription = (description) => {
  if (typeof description !== "string")
    throw new BadRequestError("Field 'description' must be a string.", {
      code: "E2_15",
    });

  const trimmed = description.trim();

  const descriptionMaxLength = userConfig.MAX_DESCRIPTION_LENGTH;
  console.log(descriptionMaxLength);

  if (description.length > descriptionMaxLength)
    throw new BadRequestError(
      `Invalid 'description'. ${descriptionMaxLength} characters long is the maximum allowed.`,
      {
        code: "E2_16",
      }
    );

  return trimmed;
};

export { validateDescription };
