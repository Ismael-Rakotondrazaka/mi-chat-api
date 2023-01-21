"use strict";
/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("friend_requests", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    sender_id: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    receiver_id: {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
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
  await queryInterface.dropTable("friend_requests");
};
