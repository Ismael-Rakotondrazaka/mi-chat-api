import dotenv from "dotenv";
dotenv.config();

import { Storage } from "@google-cloud/storage";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = new Storage({
  projectId: process.env.GCS_BUCKET_NAME,
  keyFilename: resolve(__dirname, "../../../GCSServiceAccount.json"),
});

export { storage };
