import { showDatabase, storeDatabase } from "../../../../../controllers/admin/index.js";
import { authMiddleware } from "../../../../../middlewares/admin/index.js";
import { uploadFile } from "../../../../../services/multer/index.js";

import { Router } from "express";
const adminDatabaseRoutes = Router();

adminDatabaseRoutes.get("/", authMiddleware, showDatabase);
adminDatabaseRoutes.post(
  "/",
  authMiddleware,
  uploadFile.single("database"),
  storeDatabase
);

export { adminDatabaseRoutes };
