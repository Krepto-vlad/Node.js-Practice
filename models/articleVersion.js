"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ArticleVersion extends Model {
    static associate(models) {
      ArticleVersion.belongsTo(models.Article, {
        foreignKey: "articleId",
        as: "Article",
      });
    }
  }
  ArticleVersion.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      articleId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ArticleVersion",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["articleId", "version"],
        },
      ],
    }
  );
  return ArticleVersion;
};
