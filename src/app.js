import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();

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

app.use("*", (req, res, next) =>
  res.send({
    data: {
      message: "Hello, world!",
    },
  })
);

export { app };
