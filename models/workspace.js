"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Workspace extends Model {
    static associate(models) {
      Workspace.hasMany(models.Article, {
        foreignKey: "workspaceId",
        as: "Articles",
      });
    }
  }
  Workspace.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Workspace",
      timestamps: true,
    }
  );
  return Workspace;
};
