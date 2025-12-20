"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    static associate(models) {
      Article.belongsTo(models.Workspace, {
        foreignKey: "workspaceId",
        as: "Workspace",
      });
      Article.hasMany(models.Comment, {
        foreignKey: "articleId",
        as: "Comments",
      });
      Article.hasMany(models.Attachment, {
        foreignKey: "articleId",
        as: "Attachments",
      });
    }
  }
  Article.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: DataTypes.STRING,
      content: DataTypes.TEXT,
      workspaceId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Article",
      timestamps: true,
    }
  );
  return Article;
};
