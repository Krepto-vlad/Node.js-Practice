const jwt = require("jsonwebtoken");
const { User } = require("../../models");
const db = require("../../models");

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    next(error);
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};

const isCreatorOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (req.user.role === "admin" || req.user.id === resourceUserId) {
      return next();
    }

    return res
      .status(403)
      .json({ error: "You do not have permission to perform this action" });
  };
};

const canModifyArticle = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const article = await db.Article.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    if (req.user.role === "admin") {
      req.article = article;
      return next();
    }

    if (article.userId && article.userId === req.user.id) {
      req.article = article;
      return next();
    }

    return res.status(403).json({
      error: "You do not have permission to modify this article",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  isAdmin,
  isCreatorOrAdmin,
  canModifyArticle,
};
