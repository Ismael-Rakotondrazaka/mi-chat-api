"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Conversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // relation between User and Conversation
      models.Conversation.belongsToMany(models.User, {
        as: "Participants",
        through: models.Participant,
        foreignKey: "conversation_id",
        otherKey: "user_id",
      });
    }
  }
  Conversation.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      type: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      channelId: {
        field: "channel_id",
        type: DataTypes.TEXT,
        allowNull: false,
      },
      imageUrl: {
        field: "image_url",
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Conversation",
      tableName: "conversations",
      timestamps: true,
    }
  );
  return Conversation;
};
