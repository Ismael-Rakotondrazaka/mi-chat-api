"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Friendship extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Friendship.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        field: "user_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      friendId: {
        type: DataTypes.INTEGER,
        field: "friend_id",
        references: {
          model: "users",
          key: "id",
        },
      },
      conversationId: {
        field: "conversation_id",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "conversations",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Friendship",
      tableName: "friendships",
      timestamps: true,
    }
  );
  return Friendship;
};
