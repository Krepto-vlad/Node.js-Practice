const fs = require("fs").promises;
const path = require("path");
const { DATA_DIR } = require("../constants");

async function getAllArticles() {
  const files = await fs.readdir(DATA_DIR);
  const articles = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const content = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
    const article = JSON.parse(content);
    articles.push({ id: article.id, title: article.title });
  }
  return articles;
}

async function getArticleById(id) {
  const filePath = path.join(DATA_DIR, `${id}.json`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function createArticle(article) {
  const filePath = path.join(DATA_DIR, `${article.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(article, null, 2));
}

async function updateArticle(id, data) {
  const filePath = path.join(DATA_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify({ id, ...data }, null, 2));
}

async function deleteArticle(id) {
  const filePath = path.join(DATA_DIR, `${id}.json`);
  await fs.unlink(filePath);
}

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};
