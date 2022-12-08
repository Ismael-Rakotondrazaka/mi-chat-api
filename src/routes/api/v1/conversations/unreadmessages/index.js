import { Router } from "express";
const unreadMessageRoutes = Router({
  mergeParams: true,
});

import { authMiddleware } from "#middlewares/index.js";
import {
  indexUnreadMessage,
  destroyUnreadMessage,
} from "#controllers/index.js";

unreadMessageRoutes.get("/", authMiddleware, indexUnreadMessage);

unreadMessageRoutes.delete("/", authMiddleware, destroyUnreadMessage);

export { unreadMessageRoutes };
