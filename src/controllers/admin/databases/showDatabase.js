import { ServerError } from "../../../utils/errors/index.js";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const showDatabase = async (req, res, next) => {
  try {
    const dbConnection = process.env.DB_CONNECTION;
    const dbName = process.env.DB_NAME;

    if (dbConnection === "sqlite") {
      return res.sendFile(path.join(__dirname, "../../../database/", dbName));
    } else {
      throw new ServerError("Not implemented yet.", {
        code: "E1_4",
      });
    }
  } catch (error) {
    next(error);
  }
};

export { showDatabase };
