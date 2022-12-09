import {
  updateUser,
  showUser,
  indexUserFriend,
  indexUser,
} from "#controllers/index.js";
import { authMiddleware, userMiddleware } from "#middlewares/index.js";
import { uploadImage } from "#services/multer/index.js";

import { Router } from "express";

const userRoutes = Router();

userRoutes.use("/:userId", userMiddleware);

userRoutes.get("/", indexUser);

userRoutes.put(
  "/:userId",
  authMiddleware,
  uploadImage.single("profileImage"),
  updateUser
);

userRoutes.get("/:userId", showUser);

userRoutes.get("/:userId/friends", indexUserFriend);

export { userRoutes };
