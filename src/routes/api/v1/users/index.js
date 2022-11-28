import { updateUser } from "#controllers/index.js";
import { authMiddleware, userMiddleware } from "#middlewares/index.js";

import { Router } from "express";

const userRoutes = Router();

userRoutes.use("/:userId", userMiddleware);

userRoutes.put("/:userId", authMiddleware, updateUser);

export { userRoutes };
