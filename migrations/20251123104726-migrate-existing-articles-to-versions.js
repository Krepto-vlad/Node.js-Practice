"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    );

    const [articles] = await queryInterface.sequelize.query(
      `SELECT id, title, content, "createdAt", "updatedAt" FROM "Articles"`
    );

    for (const article of articles) {
      const [existingVersions] = await queryInterface.sequelize.query(
        `SELECT id FROM "ArticleVersions" WHERE "articleId" = :articleId`,
        {
          replacements: { articleId: article.id },
        }
      );

      if (existingVersions.length === 0) {
        await queryInterface.sequelize.query(
          `INSERT INTO "ArticleVersions" (id, "articleId", version, title, content, "createdAt", "updatedAt")
           VALUES (uuid_generate_v4(), :articleId, 1, :title, :content, :createdAt, :updatedAt)`,
          {
            replacements: {
              articleId: article.id,
              title: article.title,
              content: article.content,
              createdAt: article.createdAt,
              updatedAt: article.updatedAt,
            },
          }
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `DELETE FROM "ArticleVersions" WHERE version = 1`
    );
  },
};
