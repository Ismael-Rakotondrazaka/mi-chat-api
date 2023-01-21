"use strict";
/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("participants", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    user_id: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    conversation_id: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: "conversations",
        key: "id",
      },
    },
    nickname: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    role: {
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
  await queryInterface.dropTable("participants");
};
