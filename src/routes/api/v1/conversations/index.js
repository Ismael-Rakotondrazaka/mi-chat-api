import { Router } from "express";
const conversationRoutes = Router();

import { conversationMiddleware, authMiddleware } from "#middlewares/index.js";
import {
  showConversation,
  indexConversation,
  storeConversation,
  updateConversation,
  destroyConversation,
} from "#controllers/index.js";
import { uploadImage } from "#services/multer/index.js";

conversationRoutes.use("/:conversationId", conversationMiddleware);

conversationRoutes.get("/", authMiddleware, indexConversation);

conversationRoutes.post(
  "/",
  authMiddleware,
  uploadImage.single("profileImage"),
  storeConversation
);

conversationRoutes.get("/:conversationId", authMiddleware, showConversation);

conversationRoutes.put(
  "/:conversationId",
  authMiddleware,
  uploadImage.single("profileImage"),
  updateConversation
);

conversationRoutes.delete(
  "/:conversationId",
  authMiddleware,
  destroyConversation
);

import { participantRoutes } from "./participants/index.js";
conversationRoutes.use("/:conversationId/participants", participantRoutes);

import { messageRoutes } from "./messages/index.js";
conversationRoutes.use("/:conversationId/messages", messageRoutes);

import { unreadMessageRoutes } from "./unreadmessages/index.js";
conversationRoutes.use("/:conversationId/unreadmessages", unreadMessageRoutes);

export { conversationRoutes };
