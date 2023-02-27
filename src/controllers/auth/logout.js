import { BadRequestError, UnauthorizedError } from "../../utils/errors/index.js";
import { RefreshToken } from "../../models/index.js";

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      throw new BadRequestError("Property 'refreshToken' is required.", {
        code: "E2_17",
      });

    const foundToken = await RefreshToken.findOne({
      where: {
        token: refreshToken,
      },
    });

    if (!foundToken) throw new UnauthorizedError();

    // delete the refreshToken
    await foundToken.destroy();

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export { logout };
