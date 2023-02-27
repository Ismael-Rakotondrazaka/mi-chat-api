import { User, RefreshToken } from "../../models/index.js";
import { BadRequestError, UnauthorizedError } from "../../utils/errors/index.js";
import { createRefreshToken, createAccessToken } from "../../utils/tokens/index.js";
import { createDataResponse } from "../../utils/responses/index.js";

import jwt from "jsonwebtoken";

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      throw new BadRequestError("Field 'refreshToken' is required.", {
        code: "E2_17",
      });

    const foundToken = await RefreshToken.findOne({
      include: [
        {
          association: "User",
          attributes: ["id", "email"],
        },
      ],
      where: {
        token: refreshToken,
      },
    });

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    // no RT found
    if (!foundToken) {
      jwt.verify(refreshToken, refreshTokenSecret, {}, async (err, decoded) => {
        // someone is trying to use inexistant refreshToken
        if (err) {
          return next(new UnauthorizedError());
        } else {
          const hackedUserId = decoded?.user?.id;
          const hackedUser = await User.findByPk(hackedUserId);

          if (!hackedUser) {
            // ! maybe the refreshTokenSecret has been leaked or the user's account has been deleted
            return next(new UnauthorizedError());
          } else {
            await RefreshToken.destroy({
              where: {
                userId: hackedUserId,
              },
            });

            return next(new UnauthorizedError());
          }
        }
      });
    } else {
      jwt.verify(refreshToken, refreshTokenSecret, {}, async (err) => {
        // the token is expired or the refreshTokenSecret has been changed
        if (err) {
          return next(new UnauthorizedError());
        } else {
          const refreshTokenData = {
            user: {
              id: foundToken.User.id,
              email: foundToken.User.email,
            },
          };
          const { refreshToken: newRefreshToken, expiresAt } =
            createRefreshToken(refreshTokenData);

          // delete the old refreshToken
          // we don't destroy the refreshToken directly because we need it later
          await RefreshToken.destroy({
            where: {
              id: foundToken.id,
            },
          });

          // save the new refreshToken
          await RefreshToken.create({
            token: newRefreshToken,
            userId: foundToken.User.id,
            expiresAt: expiresAt,
          });

          const accessTokenData = {
            user: {
              id: foundToken.User.id,
              email: foundToken.User.email,
            },
          };

          const { accessToken } = createAccessToken(accessTokenData);

          return res.json(
            createDataResponse({
              tokens: {
                accessToken: accessToken,
                refreshToken: newRefreshToken,
                tokenType: "bearer",
              },
            })
          );
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

export { refresh };
