import dotenv from "dotenv";
dotenv.config();

import { authMiddleware } from "#middlewares/index.js";
import { connectHandler } from "./connectHandler.js";

import { Server } from "socket.io";

const socketIO = new Server();

// turn express middleware to socket middleware
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

socketIO.use(wrap(authMiddleware));

const onConnection = (socket) => connectHandler(socketIO, socket);

socketIO.on("connection", onConnection);

export { socketIO };
