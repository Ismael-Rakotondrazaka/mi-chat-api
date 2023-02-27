"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Participant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // relation between Conversation and Participant
      models.Participant.belongsTo(models.Conversation, {
        as: "Conversation",
        foreignKey: "conversation_id",
      });

      // relation between User and Participant
      models.Participant.belongsTo(models.User, {
        as: "Participation",
        foreignKey: "user_id",
      });
    }
  }
  Participant.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        field: "user_id",
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      conversationId: {
        field: "conversation_id",
        type: DataTypes.INTEGER,
        references: {
          model: "conversations",
          key: "id",
        },
      },
      nickname: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.TEXT,
        defaultValue: "participant",
      },
    },
    {
      sequelize,
      modelName: "Participant",
      tableName: "participants",
      timestamps: true,
    }
  );
  return Participant;
};
