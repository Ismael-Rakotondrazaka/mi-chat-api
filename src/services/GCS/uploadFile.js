import { bucket } from "./bucket.js";

const uploadFile = (
  buffer,
  options = {
    destination: "",
    contentType: "application/octet-stream",
    isPrivate: true,
    onFinish: async () => {},
    onError: () => {},
  }
) => {
  const blob = bucket.file(options.destination);

  const blobStream = blob
    .createWriteStream({
      metadata: {
        contentType: options.contentType,
      },
    })
    .on("error", options.onError)
    .on("finish", async () => {
      try {
        if (!options.isPrivate) {
          await blob.makePublic();
        }

        await options.onFinish();
      } catch (error) {
        options.onError(error);
      }
    });

  blobStream.end(buffer);
};

export { uploadFile };
