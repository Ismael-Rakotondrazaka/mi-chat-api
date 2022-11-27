"use strict";
import { Model } from "sequelize";
import { ServerError } from "#utils/errors/index.js";

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.User.hasMany(models.RefreshToken, {
        foreignKey: "user_id",
      });
    }
  }
  User.init(
    {
      firstName: {
        field: "first_name",
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        field: "last_name",
        type: DataTypes.STRING,
        allowNull: false,
      },
      fullName: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
        set() {
          throw new ServerError("Do not try to set the 'fullName' value.", {
            private: true,
            code: "E1_1",
          });
        },
      },
      email: {
        field: "email",
        type: DataTypes.STRING,
        /**
         * ! it's a constraint, not a validation. So error comes from the database
         * ! and the database try to insert data before the constraint is applied
         */
        unique: true,
        allowNull: false,
      },
      channelId: {
        field: "channel_id",
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      imageUrl: {
        field: "image_url",
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        field: "password",
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true, // ! be aware, timestamps are on 'createdAt' and 'updatedAt' in the db
    }
  );
  return User;
};
