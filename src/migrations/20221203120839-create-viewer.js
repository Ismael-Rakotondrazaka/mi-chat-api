"use strict";

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("viewers", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    message_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "messages",
        key: "id",
      },
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    unread: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
};
export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("viewers");
};
