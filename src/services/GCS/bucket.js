import dotenv from "dotenv";
dotenv.config();

import { storage } from "./storage.js";

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

export { bucket };
