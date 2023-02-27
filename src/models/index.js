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
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    dialect: dbConnection,
    host: dbHost,
    port: dbPort,
    logging: logging,
    sync: true,
  });
}

import createUserModel from "./User.js";
import createRefreshTokenModel from "./RefreshToken.js";
import createFriendshipModel from "./Friendship.js";
import createFriendRequestModel from "./FriendRequest.js";
import createConversationModel from "./Conversation.js";
import createParticipantModel from "./Participant.js";
import createMessageModel from "./Message.js";
import createViewerModel from "./Viewer.js";
import createGroupConversationLeftModel from "./GroupConversationLeft.js";

const User = createUserModel(sequelize, DataTypes);
const RefreshToken = createRefreshTokenModel(sequelize, DataTypes);
const Friendship = createFriendshipModel(sequelize, DataTypes);
const FriendRequest = createFriendRequestModel(sequelize, DataTypes);
const Conversation = createConversationModel(sequelize, DataTypes);
const Participant = createParticipantModel(sequelize, DataTypes);
const Message = createMessageModel(sequelize, DataTypes);
const Viewer = createViewerModel(sequelize, DataTypes);
const GroupConversationLeft = createGroupConversationLeftModel(
  sequelize,
  DataTypes
);

db[User.name] = User;
db[RefreshToken.name] = RefreshToken;
db[Friendship.name] = Friendship;
db[FriendRequest.name] = FriendRequest;
db[Conversation.name] = Conversation;
db[Participant.name] = Participant;
db[Message.name] = Message;
db[Viewer.name] = Viewer;
db[GroupConversationLeft.name] = GroupConversationLeft;

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
export {
  sequelize,
  Sequelize,
  User,
  RefreshToken,
  Friendship,
  FriendRequest,
  Conversation,
  Participant,
  Message,
  Viewer,
  GroupConversationLeft,
};
