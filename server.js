const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const { DATA_DIR } = require("./constants");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json());

fs.mkdir(DATA_DIR, { recursive: true });

app.get("/articles", async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const articles = [];
    for (const file of files) {
      const content = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
      const article = JSON.parse(content);
      articles.push({ id: article.id, title: article.title });
    }
    res.json(articles);
  } catch (e) {
    res.status(500).json({ error: "Failed to read articles." });
  }
});

app.get("/articles/:id", async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    for (const file of files) {
      const content = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
      const article = JSON.parse(content);
      if (article.id === req.params.id) {
        return res.json(article);
      }
    }
    res.status(404).json({ error: "Article not found." });
  } catch (e) {
    res.status(500).json({ error: "Failed to read article." });
  }
});

app.post("/articles", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }
  const id = uuidv4();
  const article = { id, title, content };
  try {
    await fs.writeFile(
      path.join(DATA_DIR, `${id}.json`),
      JSON.stringify(article, null, 2)
    );
    res.status(201).json({ id });
  } catch (e) {
    res.status(500).json({ error: "Failed to save article." });
  }
});

app.put("/articles/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    const files = await fs.readdir(DATA_DIR);
    const fileName = files.find((f) => f.endsWith(".json") && f.startsWith(id));
    if (!fileName) {
      return res.status(404).json({ error: "Article not found." });
    }

    const filePath = path.join(DATA_DIR, fileName);
    const article = { id, title, content };
    await fs.writeFile(filePath, JSON.stringify(article, null, 2));
    res.json({ message: "Article updated successfully." });
  } catch (e) {
    res.status(500).json({ error: "Failed to update article." });
  }
});

app.delete("/articles/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const files = await fs.readdir(DATA_DIR);
    const fileName = files.find((f) => f.endsWith(".json") && f.startsWith(id));
    if (!fileName) {
      return res.status(404).json({ error: "Article not found." });
    }

    const filePath = path.join(DATA_DIR, fileName);
    await fs.unlink(filePath);
    res.json({ message: "Article deleted successfully." });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete article." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
