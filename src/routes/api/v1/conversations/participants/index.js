import { Router } from "express";
const participantRoutes = Router({
  mergeParams: true,
});

import { participantMiddleware, authMiddleware } from "#middlewares/index.js";
import {
  indexParticipant,
  showParticipant,
  storeParticipant,
  destroyParticipant,
} from "#controllers/index.js";

participantRoutes.use("/:participantId", participantMiddleware);

participantRoutes.get("/", authMiddleware, indexParticipant);

participantRoutes.post("/", authMiddleware, storeParticipant);

participantRoutes.get("/:participantId", authMiddleware, showParticipant);

participantRoutes.delete("/:participantId", authMiddleware, destroyParticipant);

export { participantRoutes };
