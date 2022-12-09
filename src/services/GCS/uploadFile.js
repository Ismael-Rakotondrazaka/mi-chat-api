import { bucket } from "./bucket.js";

const uploadFile = (buffer, options) => {
  const uploadFileOptions = {
    destination: "",
    contentType: "application/octet-stream",
    isPrivate: true,
    onFinish: async () => {},
    onError: () => {},
    ...options,
  };

  const blob = bucket.file(uploadFileOptions.destination);

  const blobStream = blob
    .createWriteStream({
      metadata: {
        contentType: uploadFileOptions.contentType,
      },
    })
    .on("error", uploadFileOptions.onError)
    .on("finish", async () => {
      try {
        if (!uploadFileOptions.isPrivate) {
          await blob.makePublic();
        }

        await uploadFileOptions.onFinish();
      } catch (error) {
        uploadFileOptions.onError(error);
      }
    });

  blobStream.end(buffer);
};

export { uploadFile };
