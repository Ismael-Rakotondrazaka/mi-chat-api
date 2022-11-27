import { userConfig } from "#configs/index.js";
import { BadRequestError } from "#utils/errors/index.js";

const validatePassword = (password) => {
  if (typeof password !== "string")
    throw new BadRequestError("Field 'password' must be a string.", {
      code: "E2_5",
    });

  const passwordMinLength = userConfig.MIN_PASSWORD_LENGTH;

  if (password.length < passwordMinLength)
    throw new BadRequestError(
      `Invalid 'password'. The password must be at least ${passwordMinLength} characters long.`,
      {
        code: "E2_6",
      }
    );

  return true;
};

export { validatePassword };
