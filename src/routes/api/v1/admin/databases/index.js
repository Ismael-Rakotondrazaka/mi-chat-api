import { showDatabase } from "#controllers/admin/index.js";
import { authMiddleware } from "#middlewares/admin/index.js";

import { Router } from "express";
const adminDatabaseRoutes = Router();

adminDatabaseRoutes.get("/", authMiddleware, showDatabase);

export { adminDatabaseRoutes };
