const db = require("../../models");
const Article = db.Article;
const Comment = db.Comment;
const Attachment = db.Attachment;
const Workspace = db.Workspace;
const ArticleVersion = db.ArticleVersion;
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { ATTACHMENTS_DIR } = require("../constants");

exports.list = async (req, res) => {
  try {
    const articles = await Article.findAll({
      include: [
        { model: Workspace, as: "Workspace" },
        {
          model: ArticleVersion,
          as: "Versions",
          separate: true,
          order: [["version", "DESC"]],
          limit: 1,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const articlesWithVersions = articles.map((article) => {
      const currentVersion =
        article.Versions && article.Versions.length > 0
          ? article.Versions[0]
          : null;

      return {
        ...article.toJSON(),
        currentVersion: currentVersion ? currentVersion.version : null,
        latestVersionData: currentVersion
          ? {
              version: currentVersion.version,
              title: currentVersion.title,
              content: currentVersion.content,
              createdAt: currentVersion.createdAt,
            }
          : null,
      };
    });

    res.json(articlesWithVersions);
  } catch (e) {
    console.error("Error fetching articles:", e);
    res.status(500).json({ error: "Failed to read articles." });
  }
};

exports.search = async (req, res) => {
  try {
    const { q } = req.query;

    // If no search query provided, return empty results
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchTerm = q.trim();

    // Search in both title and content (case-insensitive)
    const articles = await Article.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${searchTerm}%` } },
          { content: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      include: [
        { model: Workspace, as: "Workspace" },
        {
          model: ArticleVersion,
          as: "Versions",
          separate: true,
          order: [["version", "DESC"]],
          limit: 1,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Format results same as list endpoint
    const articlesWithVersions = articles.map((article) => {
      const currentVersion =
        article.Versions && article.Versions.length > 0
          ? article.Versions[0]
          : null;

      return {
        ...article.toJSON(),
        currentVersion: currentVersion ? currentVersion.version : null,
        latestVersionData: currentVersion
          ? {
              version: currentVersion.version,
              title: currentVersion.title,
              content: currentVersion.content,
              createdAt: currentVersion.createdAt,
            }
          : null,
      };
    });

    res.json(articlesWithVersions);
  } catch (e) {
    console.error("Error searching articles:", e);
    res.status(500).json({ error: "Failed to search articles." });
  }
};

exports.get = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [
        { model: Attachment, as: "Attachments" },
        { model: Comment, as: "Comments" },
        { model: Workspace, as: "Workspace" },
        {
          model: ArticleVersion,
          as: "Versions",
          separate: true,
          order: [["version", "DESC"]],
          limit: 1,
        },
      ],
    });
    if (!article) return res.status(404).json({ error: "Article not found." });

    console.log("Article loaded with attachments:", {
      id: article.id,
      attachmentsCount: article.Attachments?.length || 0,
      attachments: article.Attachments,
    });

    const currentVersion =
      article.Versions && article.Versions.length > 0
        ? article.Versions[0]
        : null;

    const response = {
      ...article.toJSON(),
      currentVersion: currentVersion ? currentVersion.version : null,
      latestVersionData: currentVersion
        ? {
            version: currentVersion.version,
            title: currentVersion.title,
            content: currentVersion.content,
            createdAt: currentVersion.createdAt,
          }
        : null,
    };

    res.json(response);
  } catch (e) {
    console.error("Error fetching article:", e);
    res.status(500).json({ error: "Failed to fetch article." });
  }
};

exports.create = async (req, res) => {
  const { title, content, workspaceId } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }
  if (!workspaceId) {
    return res.status(400).json({ error: "Workspace ID is required." });
  }

  try {
    // User is already authenticated by middleware
    const result = await db.sequelize.transaction(async (t) => {
      const article = await Article.create(
        {
          title,
          content,
          workspaceId,
          userId: req.user.id,
        },
        { transaction: t },
      );

      await ArticleVersion.create(
        {
          articleId: article.id,
          version: 1,
          title,
          content,
        },
        { transaction: t },
      );

      return article;
    });

    res.status(201).json({ id: result.id });
  } catch (e) {
    console.error("Error creating article:", e);
    res.status(500).json({ error: "Failed to save article." });
  }
};

exports.update = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    const article = req.article;

    const lastVersion = await ArticleVersion.findOne({
      where: { articleId: article.id },
      order: [["version", "DESC"]],
    });

    const nextVersion = lastVersion ? lastVersion.version + 1 : 1;

    await db.sequelize.transaction(async (t) => {
      await ArticleVersion.create(
        {
          articleId: article.id,
          version: nextVersion,
          title,
          content,
        },
        { transaction: t },
      );

      article.title = title;
      article.content = content;
      await article.save({ transaction: t });
    });

    res.notify &&
      res.notify("article-updated", { id: req.params.id, type: "edit" });
    res.json({
      message: "Article updated successfully.",
      version: nextVersion,
    });
  } catch (e) {
    console.error("Error updating article:", e);
    res.status(500).json({ error: "Failed to update article." });
  }
};

exports.delete = async (req, res) => {
  try {
    const article = req.article;

    const articleWithAttachments = await Article.findByPk(article.id, {
      include: [{ model: Attachment, as: "Attachments" }],
    });

    if (
      articleWithAttachments.Attachments &&
      articleWithAttachments.Attachments.length > 0
    ) {
      for (const attachment of articleWithAttachments.Attachments) {
        const filePath = path.join(ATTACHMENTS_DIR, attachment.filename);
        try {
          await fs.promises.unlink(filePath);
        } catch (err) {
          console.error("Error deleting file:", filePath, err);
        }
      }
    }

    await article.destroy();
    res.json({ message: "Article deleted successfully." });
  } catch (e) {
    console.error("Error deleting article:", e);
    res.status(500).json({ error: "Failed to delete article." });
  }
};

exports.getVersions = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found." });

    const versions = await ArticleVersion.findAll({
      where: { articleId: req.params.id },
      order: [["version", "DESC"]],
    });

    res.json(versions);
  } catch (e) {
    console.error("Error fetching versions:", e);
    res.status(500).json({ error: "Failed to fetch versions." });
  }
};

exports.getVersion = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found." });

    const version = await ArticleVersion.findOne({
      where: {
        articleId: req.params.id,
        version: parseInt(req.params.versionNumber),
      },
    });

    if (!version) {
      return res.status(404).json({ error: "Version not found." });
    }

    const response = {
      ...article.toJSON(),
      versionData: {
        version: version.version,
        title: version.title,
        content: version.content,
        createdAt: version.createdAt,
      },
    };

    res.json(response);
  } catch (e) {
    console.error("Error fetching version:", e);
    res.status(500).json({ error: "Failed to fetch version." });
  }
};
