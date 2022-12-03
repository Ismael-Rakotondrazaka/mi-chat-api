"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class GroupConversationLeft extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // relations between User and ConversationLeft
      models.GroupConversationLeft.belongsTo(models.User, {
        foreignKey: "user_id",
      });
    }
  }

  GroupConversationLeft.init(
    {
      conversationId: {
        field: "conversation_id",
        type: DataTypes.INTEGER,
        references: {
          model: "conversations",
          key: "id",
        },
      },
      userId: {
        field: "user_id",
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      modelName: "GroupConversationLeft",
      tableName: "group_conversations_left",
      timestamps: true,
    }
  );
  return GroupConversationLeft;
};
