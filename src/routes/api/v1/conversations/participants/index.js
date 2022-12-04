import { Router } from "express";
const participantRoutes = Router({
  mergeParams: true,
});

import { participantMiddleware, authMiddleware } from "#middlewares/index.js";
import { indexParticipant, showParticipant } from "#controllers/index.js";

participantRoutes.use("/:participantId", participantMiddleware);

participantRoutes.get("/", authMiddleware, indexParticipant);

participantRoutes.get("/:participantId", authMiddleware, showParticipant);

export { participantRoutes };
