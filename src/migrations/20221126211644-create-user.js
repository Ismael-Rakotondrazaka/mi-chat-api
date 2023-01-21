"use strict";
/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("users", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    firstName: {
      field: "first_name",
      allowNull: false,
      type: Sequelize.STRING,
    },
    lastName: {
      field: "last_name",
      allowNull: false,
      type: Sequelize.STRING,
    },
    description: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    imageUrl: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    channelId: {
      field: "channel_id",
      allowNull: false,
      type: Sequelize.STRING,
    },
    email: {
      allowNull: false,
      type: Sequelize.STRING,
      unique: true,
    },
    password: {
      allowNull: false,
      type: Sequelize.STRING,
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
  await queryInterface.dropTable("users");
};
