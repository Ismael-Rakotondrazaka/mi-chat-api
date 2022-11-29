import { Router } from "express";
const friendRequestRoutes = Router();

import { friendRequestMiddleware, authMiddleware } from "#middlewares/index.js";

import {
  indexFriendRequest,
  storeFriendRequest,
  destroyFriendRequest,
  updateFriendRequest,
} from "#controllers/index.js";

friendRequestRoutes.use("/:friendRequestId", friendRequestMiddleware);

friendRequestRoutes.get("/", authMiddleware, indexFriendRequest);

friendRequestRoutes.post("/", authMiddleware, storeFriendRequest);

friendRequestRoutes.delete(
  "/:friendRequestId",
  authMiddleware,
  destroyFriendRequest
);

friendRequestRoutes.put(
  "/:friendRequestId",
  authMiddleware,
  updateFriendRequest
);

export { friendRequestRoutes };
