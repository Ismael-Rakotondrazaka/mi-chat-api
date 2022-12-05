import { participantConfig } from "#configs/index.js";
import { BadRequestError } from "#utils/errors/index.js";

const validateNickname = (nickname) => {
  if (typeof nickname !== "string")
    throw new BadRequestError("Field 'nickname' must be a string.", {
      code: "E2_",
    });

  const trimmed = nickname.trim();

  const maxNicknameLength = participantConfig.MAX_NICKNAME_LENGTH;

  if (nickname.length > maxNicknameLength) {
    throw new BadRequestError(
      `Invalid 'nickname'. ${maxNicknameLength} is the maximum allowed for nicknames.`
    );
  }

  return trimmed.length !== 0 ? trimmed : null;
};

export { validateNickname };
