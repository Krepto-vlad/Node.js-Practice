const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const articlesController = require("../controllers/articlesController");
const { authenticate, canModifyArticle } = require("../middleware/auth");
const multer = require("multer");
const {
  ATTACHMENTS_DIR,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_UPLOAD,
} = require("../constants");
const db = require("../../models");
const Article = db.Article;
const Attachment = db.Attachment;

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

const commentsRouter = require("./comments");
router.use("/:articleId/comments", commentsRouter);

router.get("/search", articlesController.search);
router.get("/", articlesController.list);
router.get("/:id", articlesController.get);
router.post("/", authenticate, articlesController.create);
router.put("/:id", authenticate, canModifyArticle, articlesController.update);
router.delete(
  "/:id",
  authenticate,
  canModifyArticle,
  articlesController.delete,
);
router.get("/:id/versions", articlesController.getVersions);
router.get("/:id/versions/:versionNumber", articlesController.getVersion);

router.post(
  "/:id/attachments",
  upload.array("files", MAX_FILES_PER_UPLOAD),
  async (req, res) => {
    try {
      const article = await Article.findByPk(req.params.id);
      if (!article)
        return res.status(404).json({ error: "Article not found." });

      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ error: "No files uploaded or invalid file type." });
      }

      console.log(
        `Uploading ${req.files.length} file(s) to article ${req.params.id}`,
      );

      for (const file of req.files) {
        await Attachment.create({
          articleId: req.params.id,
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
      }

      res.notify &&
        res.notify("article-updated", { id: req.params.id, type: "file" });
      res.json({
        message: `${req.files.length} file(s) uploaded successfully`,
        files: req.files,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload files." });
    }
  },
);

router.delete("/:id/attachments/:filename", async (req, res) => {
  try {
    const { id } = req.params;
    const filename = decodeURIComponent(req.params.filename);

    const article = await Article.findByPk(id);
    if (!article) return res.status(404).json({ error: "Article not found." });

    const attachment = await Attachment.findOne({
      where: { articleId: id, filename: filename },
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found." });
    }

    const filePath = path.join(ATTACHMENTS_DIR, filename);
    console.log("Trying to delete:", filePath);

    try {
      await fs.promises.unlink(filePath);
      console.log("File deleted successfully:", filename);
    } catch (err) {
      console.error("Delete file error:", err);
    }

    await attachment.destroy();

    res.notify &&
      res.notify("article-updated", { id: req.params.id, type: "file-delete" });
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete file." });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: `File size exceeds the limit of ${
          MAX_FILE_SIZE / 1024 / 1024
        }MB`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: `Maximum ${MAX_FILES_PER_UPLOAD} files allowed per upload`,
      });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
