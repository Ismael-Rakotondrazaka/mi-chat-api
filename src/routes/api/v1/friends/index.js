import { indexFriend, destroyFriend } from "../../../../controllers/index.js";
import { authMiddleware, userMiddleware } from "../../../../middlewares/index.js";

import { Router } from "express";

const friendRoutes = Router();

friendRoutes.use("/:userId", userMiddleware);

friendRoutes.get("/", authMiddleware, indexFriend);

friendRoutes.delete("/:userId", authMiddleware, destroyFriend);

export { friendRoutes };
