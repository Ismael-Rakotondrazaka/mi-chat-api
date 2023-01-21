import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";

import { socketIO } from "./services/socketIO/index.js";
import http from "http";
const httpServer = http.createServer(app);

const corsOrigin = process.env.FRONTEND_URL.split(",") || [];
socketIO.attach(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

const port = process.env.PORT || 8001;
httpServer.listen(port, () => {
  console.log("listening on port " + port);
});
