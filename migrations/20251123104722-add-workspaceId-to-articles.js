"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Articles", "workspaceId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "Workspaces",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addIndex("Articles", ["workspaceId"]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("Articles", ["workspaceId"]);
    await queryInterface.removeColumn("Articles", "workspaceId");
  },
};
