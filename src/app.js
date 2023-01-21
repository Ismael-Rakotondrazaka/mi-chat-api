import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();

// synchronize the db
import { sequelize } from "#models/index.js";
await sequelize.sync({
  logging: false,
});

import cors from "cors";
app.use(
  cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : [],
    credentials: true,
  })
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

import { authRoutes } from "#routes/api/v1/auth/index.js";
app.use("/api/v1/auth", authRoutes);

import { tokenRoutes } from "#routes/api/v1/tokens/index.js";
app.use("/api/v1/tokens", tokenRoutes);

import { userRoutes } from "#routes/api/v1/users/index.js";
app.use("/api/v1/users", userRoutes);

import { friendRequestRoutes } from "#routes/api/v1/friendrequests/index.js";
app.use("/api/v1/friendrequests", friendRequestRoutes);

import { friendRoutes } from "#routes/api/v1/friends/index.js";
app.use("/api/v1/friends", friendRoutes);

import { conversationRoutes } from "#routes/api/v1/conversations/index.js";
app.use("/api/v1/conversations", conversationRoutes);

import { adminDatabaseRoutes } from "#routes/api/v1/admin/databases/index.js";
app.use("/api/v1/admin/databases", adminDatabaseRoutes);

// this one can be used as health check
app.use("/hello", (req, res, next) =>
  res.send({
    data: {
      message: "Hello, world!",
    },
  })
);

import { NotFoundError } from "#utils/errors/index.js";
app.use("*", () => {
  throw new NotFoundError();
});

import { errorMiddleware } from "#middlewares/index.js";
app.use(errorMiddleware);

export { app };
