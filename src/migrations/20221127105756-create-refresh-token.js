"use strict";
/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("refresh_tokens", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userId: {
      field: "user_id",
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    expiresAt: {
      field: "expires_at",
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
};
export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("refresh_tokens");
};
