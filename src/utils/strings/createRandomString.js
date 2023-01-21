import { nanoid } from "nanoid";

const createRandomString = (size = 21) => {
  return nanoid(size);
};

export { createRandomString };
