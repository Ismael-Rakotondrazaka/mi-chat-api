import { BadRequestError } from "../../utils/errors/index.js";

import validator from "validator";

const validateEmail = (email) => {
  if (typeof email !== "string")
    throw new BadRequestError("Field 'email' must be a string.", {
      code: "E2_2",
    });

  const trimmed = email.trim();

  if (!validator.isEmail(trimmed))
    throw new BadRequestError("Invalid 'email'.", {
      code: "E2_3",
    });

  return trimmed;
};

export { validateEmail };
