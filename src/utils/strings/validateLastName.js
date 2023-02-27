import { BadRequestError } from "../../utils/errors/index.js";
import { userConfig } from "../../configs/index.js";

const validateLastName = (lastName) => {
  if (typeof lastName !== "string")
    throw new BadRequestError("Field 'lastName' must be a string.", {
      code: "E2_11",
    });

  const formatted = lastName.replace(/\s+/g, " ").trim();

  if (!/^[\p{L}\p{M} ]+$/gu.test(formatted))
    throw new Error(
      "Invalid 'lastName'. It contains non-Unicode letters, numbers or special characters.",
      {
        code: "E2_23",
      }
    );

  const lastNameMaxLength = userConfig.MAX_LAST_NAME_LENGTH;

  if (lastName.length > lastNameMaxLength)
    throw new BadRequestError(
      `Invalid 'lastName'. ${lastNameMaxLength} characters long is the maximum allowed.`,
      {
        code: "E2_12",
      }
    );

  return formatted;
};

export { validateLastName };
