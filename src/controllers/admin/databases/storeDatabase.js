import { ServerError, BadRequestError } from "../../../utils/errors/index.js";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storeDatabase = async (req, res, next) => {
  try {
    const dbConnection = process.env.DB_CONNECTION;
    const dbName = process.env.DB_NAME;
    const database = req.file;

    if (!database)
      throw new BadRequestError("Field 'database' is missing.", {
        code: "E2_49",
      });

    if (dbConnection === "sqlite") {
      fs.writeFile(
        path.join(__dirname, "../../../database/", dbName),
        database.buffer,
        (err) => {
          if (err) {
            next(err);
          } else {
            return res.sendStatus(204);
          }
        }
      );
    } else {
      throw new ServerError("Not implemented yet.", {
        code: "E1_4",
      });
    }
  } catch (error) {
    next(error);
  }
};

export { storeDatabase };
