"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    static associate(models) {
      Article.belongsTo(models.Workspace, {
        foreignKey: "workspaceId",
        as: "Workspace",
      });
      Article.belongsTo(models.User, {
        foreignKey: "userId",
        as: "User",
      });
      Article.hasMany(models.Comment, {
        foreignKey: "articleId",
        as: "Comments",
      });
      Article.hasMany(models.Attachment, {
        foreignKey: "articleId",
        as: "Attachments",
      });
      Article.hasMany(models.ArticleVersion, {
        foreignKey: "articleId",
        as: "Versions",
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
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
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
