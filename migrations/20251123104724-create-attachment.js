"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Attachments", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      articleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Articles",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      originalname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mimetype: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      size: {
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

    await queryInterface.addIndex("Attachments", ["articleId"]);
    await queryInterface.addIndex("Attachments", ["filename"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Attachments");
  },
};
