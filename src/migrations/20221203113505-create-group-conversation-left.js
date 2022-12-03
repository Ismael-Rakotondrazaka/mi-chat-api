"use strict";
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("group_conversations_left", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    conversationId: {
      field: "conversation_id",
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "conversations",
        key: "id",
      },
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
    name: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    image_url: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
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
  await queryInterface.dropTable("group_conversations_left");
}
