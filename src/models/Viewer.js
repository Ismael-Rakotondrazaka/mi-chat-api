"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Viewer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // relations between User and Viewer
      models.Viewer.belongsTo(models.User, {
        as: "User",
        foreignKey: "user_id",
      });

      // relations between Message and Viewer
      models.Viewer.belongsTo(models.Message, {
        foreignKey: "message_id",
      });
    }
  }

  Viewer.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      messageId: {
        field: "message_id",
        type: DataTypes.INTEGER,
        references: {
          model: "messages",
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
      unread: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Viewer",
      tableName: "viewers",
      timestamps: true,
    }
  );
  return Viewer;
};
