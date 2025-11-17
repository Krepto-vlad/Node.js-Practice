const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const articlesController = require("../controllers/articlesController");
const multer = require("multer");
const {
  ATTACHMENTS_DIR,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} = require("../constants");
const { getArticleById, updateArticle } = require("../models/articleModel");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ATTACHMENTS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"), false);
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

router.get("/", articlesController.list);
router.get("/:id", articlesController.get);
router.post("/", articlesController.create);
router.put("/:id", articlesController.update);
router.delete("/:id", articlesController.delete);

router.post("/:id/attachments", upload.single("file"), async (req, res) => {
  const article = await getArticleById(req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found." });
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "No file uploaded or invalid file type." });
  }
  article.attachments = article.attachments || [];
  article.attachments.push({
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
  await updateArticle(req.params.id, article);
  res.notify &&
    res.notify("article-updated", { id: req.params.id, type: "file" });
  res.json({ message: "File uploaded", file: req.file });
});

router.delete("/:id/attachments/:filename", async (req, res) => {
  const { id } = req.params;
  const filename = decodeURIComponent(req.params.filename);
  const article = await getArticleById(id);
  if (!article) return res.status(404).json({ error: "Article not found." });

  const filePath = path.join(ATTACHMENTS_DIR, filename);
  console.log("Trying to delete:", filePath);
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(404).json({ error: "File not found." });
  }

  article.attachments = (article.attachments || []).filter(
    (file) => file.filename !== filename
  );
  await updateArticle(id, article);
  res.json({ message: "File deleted" });
});

module.exports = router;
