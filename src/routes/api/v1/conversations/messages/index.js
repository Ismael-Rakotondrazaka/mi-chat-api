import { Router } from "express";
const messageRoutes = Router({
  mergeParams: true,
});

import {
  messageMiddleware,
  authMiddleware,
  messageFileMiddleware,
} from "#middlewares/index.js";
import {
  indexMessage,
  storeMessage,
  showMessage,
  destroyMessage,
  showMessageFile,
} from "#controllers/index.js";
import { uploadFile } from "#services/multer/index.js";

messageRoutes.use("/:messageId", messageMiddleware);

messageRoutes.get("/", authMiddleware, indexMessage);

messageRoutes.post(
  "/",
  authMiddleware,
  uploadFile.single("content"),
  storeMessage
);

messageRoutes.get("/:messageId", authMiddleware, showMessage);

messageRoutes.delete("/:messageId", authMiddleware, destroyMessage);

messageRoutes.use("/:messageId/files/:filename", messageFileMiddleware);

messageRoutes.get(
  "/:messageId/files/:filename",
  authMiddleware,
  showMessageFile
);

export { messageRoutes };
