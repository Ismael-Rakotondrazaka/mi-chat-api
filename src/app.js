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

app.use("/hello", (req, res, next) =>
  res.send({
    data: {
      message: "Hello, world!",
    },
  })
);

app.use("/error", (req, res, next) => {
  throw new Error("Intentional error.");
});

import { NotFoundError } from "#utils/errors/index.js";
app.use("*", (req, res, next) => {
  throw new NotFoundError("should return a 404 response", {
    private: false,
    code: "E3_0_just_a_test",
  });
});

import { errorMiddleware } from "#middlewares/index.js";
app.use(errorMiddleware);

export { app };
