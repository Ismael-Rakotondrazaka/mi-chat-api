"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.RefreshToken.belongsTo(models.User, {
        foreignKey: "user_id",
      });
    }
  }
  RefreshToken.init(
    {
      token: {
        field: "token",
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        field: "user_id",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      expiresAt: {
        field: "expires_at",
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "RefreshToken",
      tableName: "refresh_tokens",
      timestamps: false,
    }
  );
  return RefreshToken;
};
