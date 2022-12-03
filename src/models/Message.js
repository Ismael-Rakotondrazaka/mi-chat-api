"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // relations between Conversation and Message
      models.Message.belongsTo(models.Conversation, {
        foreignKey: "conversation_id",
      });

      // relations between User and Message
      models.Message.belongsTo(models.User, {
        as: "Sender",
        foreignKey: "sender_id",
      });
      models.Message.belongsToMany(models.User, {
        as: "Viewers",
        through: models.Viewer,
        foreignKey: "message_id",
        otherKey: "user_id",
      });
    }
  }

  Message.init(
    {
      conversationId: {
        field: "conversation_id",
        type: DataTypes.INTEGER,
        references: {
          model: "conversations",
          key: "id",
        },
      },
      type: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      senderId: {
        field: "sender_id",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
      timestamps: true,
    }
  );
  return Message;
};
