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

conversationRoutes.use("/:conversationId", conversationMiddleware);

conversationRoutes.get("/", authMiddleware, indexConversation);

conversationRoutes.post("/", authMiddleware, storeConversation);

conversationRoutes.get("/:conversationId", authMiddleware, showConversation);

conversationRoutes.put("/:conversationId", authMiddleware, updateConversation);

conversationRoutes.delete(
  "/:conversationId",
  authMiddleware,
  destroyConversation
);

import { participantRoutes } from "./participants/index.js";
conversationRoutes.use("/:conversationId/participants", participantRoutes);

export { conversationRoutes };
