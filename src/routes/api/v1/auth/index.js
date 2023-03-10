import { login, register, whoami, logout } from "../../../../controllers/index.js";
import { authMiddleware } from "../../../../middlewares/index.js";
import { uploadImage } from "../../../../services/multer/index.js";

import { Router } from "express";
const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/register", uploadImage.single("profileImage"), register);
authRoutes.get("/whoami", authMiddleware, whoami);
authRoutes.post("/logout", logout);

export { authRoutes };
