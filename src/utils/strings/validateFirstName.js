import { BadRequestError } from "../../utils/errors/index.js";
import { userConfig } from "../../configs/index.js";

const validateFirstName = (firstName) => {
  if (typeof firstName !== "string")
    throw new BadRequestError("Field 'firstName' must be a string.", {
      code: "E2_8",
    });

  const formatted = firstName
    .replace(/\s+/g, " ") // replace multiple whitespace with a single one
    .trim(); // then trim it

  if (!/^[\p{L}\p{M} ]+$/gu.test(formatted))
    throw new Error(
      "Invalid 'firstName'. It contains non-Unicode letters, numbers or special characters.",
      {
        code: "E2_22",
      }
    );

  const firstNameMaxLength = userConfig.MAX_FIRST_NAME_LENGTH;

  if (firstName.length > firstNameMaxLength)
    throw new BadRequestError(
      `Invalid 'firstName'. ${firstNameMaxLength} characters long is the maximum allowed.`,
      {
        code: "E2_9",
      }
    );

  return formatted;
};

export { validateFirstName };
