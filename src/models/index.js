"use strict";

import path from "path";
import Sequelize, { DataTypes } from "sequelize";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {};

let sequelize;

const dbConnection = process.env.DB_CONNECTION;
const appEnv = process.env.APP_ENV;
const logging = appEnv === "development" ? console.log : false;
const dbName = process.env.DB_NAME;

if (dbConnection === "sqlite") {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "../database", dbName),
    logging: logging,
  });
} else {
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    dialect: dbConnection,
    logging: logging,
    sync: true,
  });
}

import createUserModel from "./User.js";
const User = createUserModel(sequelize, DataTypes);
db[User.name] = User;

import createRefreshTokenModel from "./RefreshToken.js";
const RefreshToken = createRefreshTokenModel(sequelize, DataTypes);
db[RefreshToken.name] = RefreshToken;

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
export { sequelize, Sequelize, User, RefreshToken };
