"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Article, {
        foreignKey: "articleId",
        as: "Article",
      });
    }
  }
  Comment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      text: DataTypes.TEXT,
      articleId: DataTypes.UUID,
    },
    {
      sequelize,
      modelName: "Comment",
      timestamps: true,
    }
  );
  return Comment;
};
