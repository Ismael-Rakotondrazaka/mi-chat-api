import { bucket } from "./bucket.js";

const getSignedUrl = async (filename, options) => {
  const signedUrlOptions = {
    version: "v4",
    expires: new Date(Date.now() + +process.env.GCS_SIGNED_URL_LIFE),
    ...options,
  };

  const blob = bucket.file(filename);

  const urls = await blob.getSignedUrl(signedUrlOptions);

  return urls;
};

export { getSignedUrl };
