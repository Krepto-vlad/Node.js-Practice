const db = require("../../models");
const Article = db.Article;
const Comment = db.Comment;
const Attachment = db.Attachment;
const Workspace = db.Workspace;

exports.list = async (req, res) => {
  try {
    const articles = await Article.findAll({
      include: [
        { model: Attachment, as: "Attachments" },
        { model: Comment, as: "Comments" },
        { model: Workspace, as: "Workspace" },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(articles);
  } catch (e) {
    console.error("Error fetching articles:", e);
    res.status(500).json({ error: "Failed to read articles." });
  }
};

exports.get = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [
        { model: Attachment, as: "Attachments" },
        { model: Comment, as: "Comments" },
        { model: Workspace, as: "Workspace" },
      ],
    });
    if (!article) return res.status(404).json({ error: "Article not found." });

    console.log("Article loaded with attachments:", {
      id: article.id,
      attachmentsCount: article.Attachments?.length || 0,
      attachments: article.Attachments,
    });

    res.json(article);
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
    const article = await Article.create({ title, content, workspaceId });
    res.status(201).json({ id: article.id });
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
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found." });

    article.title = title;
    article.content = content;
    await article.save();

    res.notify &&
      res.notify("article-updated", { id: req.params.id, type: "edit" });
    res.json({ message: "Article updated successfully." });
  } catch (e) {
    console.error("Error updating article:", e);
    res.status(500).json({ error: "Failed to update article." });
  }
};

exports.delete = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [{ model: Attachment, as: "Attachments" }],
    });
    if (!article) return res.status(404).json({ error: "Article not found." });

    const fs = require("fs");
    const path = require("path");
    const { ATTACHMENTS_DIR } = require("../constants");

    if (article.Attachments && article.Attachments.length > 0) {
      for (const attachment of article.Attachments) {
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
