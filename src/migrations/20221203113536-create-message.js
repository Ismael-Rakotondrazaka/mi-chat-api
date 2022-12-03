"use strict";
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("messages", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    conversation_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "conversations",
        key: "id",
      },
    },
    type: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    sender_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
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
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("messages");
}
