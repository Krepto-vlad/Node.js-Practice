const db = require("../../models");
const Comment = db.Comment;
const Article = db.Article;

exports.list = async (req, res) => {
  try {
    const { articleId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { articleId },
      order: [["createdAt", "ASC"]],
      limit: limit,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limit);
    const hasMore = page < totalPages;

    res.json({
      comments,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasMore,
      },
    });
  } catch (e) {
    console.error("Error fetching comments:", e);
    res.status(500).json({ error: "Failed to fetch comments." });
  }
};

exports.create = async (req, res) => {
  const { articleId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Comment text is required." });
  }

  try {
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ error: "Article not found." });
    }

    const comment = await Comment.create({ articleId, text });
    res.status(201).json(comment);
  } catch (e) {
    console.error("Error creating comment:", e);
    res.status(500).json({ error: "Failed to create comment." });
  }
};

exports.update = async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Comment text is required." });
  }

  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    comment.text = text;
    await comment.save();
    res.json(comment);
  } catch (e) {
    console.error("Error updating comment:", e);
    res.status(500).json({ error: "Failed to update comment." });
  }
};

exports.delete = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    await comment.destroy();
    res.json({ message: "Comment deleted successfully." });
  } catch (e) {
    console.error("Error deleting comment:", e);
    res.status(500).json({ error: "Failed to delete comment." });
  }
};
