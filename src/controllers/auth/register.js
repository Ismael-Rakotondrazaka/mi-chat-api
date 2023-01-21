import { User, RefreshToken } from "../../models/index.js";
import { userResource } from "../../resources/index.js";
import { authConfig } from "../../configs/index.js";
import { BadRequestError, ConflictError } from "../../utils/errors/index.js";
import {
  validateFirstName,
  validateLastName,
  validatePassword,
  validateEmail,
  validateDescription,
  createRandomString,
  createFilename,
} from "../../utils/strings/index.js";
import { createAccessToken, createRefreshToken } from "../../utils/tokens/index.js";
import { createDataResponse } from "../../utils/responses/index.js";
import { uploadFile } from "../../services/GCS/index.js";

import bcrypt from "bcrypt";

const register = async (req, res, next) => {
  try {
    let {
      lastName,
      firstName,
      email,
      password,
      description,
      passwordValidation,
    } = req.body;
    let profileImage = req.file;

    const FIELDS_REQUIRED = [
      {
        name: "firstName",
        code: "E2_7",
        required: true,
      },
      {
        name: "lastName",
        code: "E2_10",
        required: true,
      },
      {
        name: "email",
        code: "E2_1",
        required: true,
      },
      {
        name: "password",
        code: "E2_4",
        required: true,
      },
      {
        name: "passwordValidation",
        code: "E2_13",
        required: true,
      },
    ];

    for (const field of FIELDS_REQUIRED) {
      const data = req.body[field.name];
      if (!data)
        throw new BadRequestError(`Field '${field.name}' is required.`, {
          code: field.code,
        });
    }

    email = validateEmail(email);

    const duplicate = await User.count({
      where: {
        email: email,
      },
    });

    if (duplicate !== 0)
      throw new ConflictError("The email is already in use.", {
        code: "E4_1",
      });

    firstName = validateFirstName(firstName);
    lastName = validateLastName(lastName);

    if (description) {
      description = validateDescription(description);
    }

    validatePassword(password);
    if (passwordValidation !== password)
      throw new BadRequestError(
        "Field 'passwordValidation' must be the same as 'password'",
        {
          code: "E2_14",
        }
      );

    const hashedPassword = bcrypt.hashSync(
      password,
      authConfig.PASSWORD_SALT_ROUNDS
    );

    const targetUserParams = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      channelId: createRandomString(),
      description: description || null,
    };

    const targetUser = await User.create(targetUserParams);

    const sendResponse = async () => {
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

      return res.status(201).json(
        createDataResponse({
          user: userResource(targetUser),
          tokens: {
            accessToken,
            refreshToken,
            tokenType: "bearer",
          },
        })
      );
    };

    if (profileImage) {
      const mimetype = profileImage.mimetype;
      const originalName = profileImage.originalname;
      const filename = createFilename(originalName, mimetype);
      const imageUrl = `/users/${targetUser.id}/files/${filename}`;
      const destination = `public/users/${targetUser.id}/${filename}`;

      uploadFile(profileImage.buffer, {
        destination,
        contentType: mimetype,
        onFinish: async () => {
          await targetUser.update({
            imageUrl: imageUrl,
          });

          sendResponse();
        },
        onError: (err) => next(err),
        isPrivate: false,
      });
    } else {
      sendResponse();
    }
  } catch (error) {
    next(error);
  }
};

export { register };
