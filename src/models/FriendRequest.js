"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class FriendRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // relation between User and FriendRequest
      models.FriendRequest.belongsTo(models.User, {
        as: "Receiver",
        foreignKey: "receiver_id",
      });
      models.FriendRequest.belongsTo(models.User, {
        as: "Sender",
        foreignKey: "sender_id",
      });
    }
  }
  FriendRequest.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
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
      receiverId: {
        field: "receiver_id",
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
      modelName: "FriendRequest",
      tableName: "friend_requests",
      timestamps: true,
    }
  );
  return FriendRequest;
};
