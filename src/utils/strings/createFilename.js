import { createRandomString } from "./createRandomString.js";

import { extension } from "mime-types";

const createFilename = (filename = "", mimetype) => {
  const suffix = createRandomString();

  const file = (filename.split(".").slice(0, -1).join(".") || filename).slice(
    0,
    20
  );

  let result = `${file}-${suffix}`;

  const ext = extension(mimetype) || "";

  if (ext) result += `.${ext}`;

  return result;
};

export { createFilename };
