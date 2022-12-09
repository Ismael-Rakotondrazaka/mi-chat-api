import { imageConfig } from "#configs/index.js";
import { storage } from "./storage";

import multer from "multer";

const imageParam = {
  storage: storage,
  fileFilter: (req, file, cb) => {
    try {
      if (imageConfig.IMAGE_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    } catch (error) {
      cb(error, false);
    }
  },
  limits: {
    fileSize: imageConfig.MAX_IMAGE_SIZE,
    files: imageConfig.MAX_IMAGE_FIELDS,
  },
};

const uploadImage = multer(imageParam);

export { uploadImage };
