import jwt from "jsonwebtoken";

const createAccessToken = (data) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const accessTokenLife = +process.env.ACCESS_TOKEN_LIFE; // string to number

  return {
    accessToken: jwt.sign(data, accessTokenSecret, {
      expiresIn: `${accessTokenLife}ms`,
    }),
    expiresAt: new Date(Date.now() + accessTokenLife),
  };
};

export { createAccessToken };
