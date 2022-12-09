import dotenv from "dotenv";
dotenv.config();

import { bucket } from "./bucket.js";

const getSignedUrl = async (
  filename,
  options = {
    version: "v4",
    expires: Date.now() + +process.env.GCS_SIGNED_URL_LIFE,
  }
) => {
  const blob = bucket.file(filename);

  urls = blob.getSignedUrl(options);

  return urls;
};

export { getSignedUrl };
