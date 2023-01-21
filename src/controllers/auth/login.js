import { User, RefreshToken } from "../../models/index.js";
import { createDataResponse } from "../../utils/responses/index.js";
import { userResource } from "../../resources/index.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../utils/errors/index.js";
import { validateEmail, validatePassword } from "../../utils/strings/index.js";
import {
  createRefreshToken,
  createAccessToken,
} from "../../utils/tokens/index.js";

import bcrypt from "bcrypt";

const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    const FIELDS = [
      {
        name: "email",
        code: "E2_1",
        required: true,
      },
      {
        name: "password",
        code: "E2_2",
        required: true,
      },
    ];

    const FIELDS_REQUIRED = FIELDS.filter((field) => field.required);

    for (const field of FIELDS_REQUIRED) {
      const data = req.body[field.name];
      if (!data)
        throw new BadRequestError(`Field '${field.name}' is required.`, {
          code: field.code,
        });
    }

    email = validateEmail(email);
    validatePassword(password);

    const targetUser = await User.findOne({
      where: {
        email,
      },
    });

    if (!targetUser)
      throw new UnauthorizedError("Credential doesn't match to our records.", {
        code: "E6_2",
      });

    const isPasswordMatch = bcrypt.compareSync(password, targetUser.password);

    if (!isPasswordMatch)
      throw new UnauthorizedError("Credential doesn't match to our records.", {
        code: "E6_2",
      });

    const refreshTokenData = {
      user: {
        id: targetUser.id,
        email: targetUser.email,
      },
    };
    const { refreshToken, expiresAt } = createRefreshToken(refreshTokenData);

    await RefreshToken.create({
      token: refreshToken,
      userId: targetUser.id,
      expiresAt: expiresAt,
    });

    const accessTokenData = {
      user: {
        id: targetUser.id,
        email: targetUser.email,
      },
    };
    const { accessToken } = createAccessToken(accessTokenData);

    return res.status(200).json(
      createDataResponse({
        user: userResource(targetUser),
        tokens: {
          accessToken,
          refreshToken,
          tokenType: "bearer",
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

export { login };
