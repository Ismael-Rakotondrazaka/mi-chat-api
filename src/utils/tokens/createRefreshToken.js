import jwt from "jsonwebtoken";

const createRefreshToken = (data) => {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  const refreshTokenLife = +process.env.REFRESH_TOKEN_LIFE;

  return {
    refreshToken: jwt.sign(data, refreshTokenSecret, {
      expiresIn: `${refreshTokenLife}ms`,
    }),
    expiresAt: new Date(Date.now() + refreshTokenLife),
  };
};

export { createRefreshToken };
