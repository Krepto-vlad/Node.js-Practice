const { v4: uuidv4 } = require("uuid");
const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../models-old/articleModel");

exports.list = async (req, res) => {
  try {
    const articles = await getAllArticles();
    res.json(articles);
  } catch {
    res.status(500).json({ error: "Failed to read articles." });
  }
};

exports.get = async (req, res) => {
  const article = await getArticleById(req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found." });
  res.json(article);
};

exports.create = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }
  const id = uuidv4();
  try {
    await createArticle({ id, title, content, attachments: [] });
    res.status(201).json({ id });
  } catch {
    res.status(500).json({ error: "Failed to save article." });
  }
};

exports.update = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }
  const article = await getArticleById(req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found." });
  try {
    await updateArticle(req.params.id, {
      title,
      content,
      attachments: article.attachments || [],
    });
    res.notify &&
      res.notify("article-updated", { id: req.params.id, type: "edit" });
    res.json({ message: "Article updated successfully." });
  } catch {
    res.status(500).json({ error: "Failed to update article." });
  }
};

exports.delete = async (req, res) => {
  const article = await getArticleById(req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found." });
  try {
    await deleteArticle(req.params.id);
    res.json({ message: "Article deleted successfully." });
  } catch {
    res.status(500).json({ error: "Failed to delete article." });
  }
};
