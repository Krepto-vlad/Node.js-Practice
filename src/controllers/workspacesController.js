const db = require("../../models");
const Workspace = db.Workspace;
const Article = db.Article;
const Comment = db.Comment;
const Attachment = db.Attachment;

exports.list = async (req, res) => {
  try {
    const workspaces = await Workspace.findAll({
      order: [["createdAt", "ASC"]],
    });
    res.json(workspaces);
  } catch (e) {
    console.error("Error fetching workspaces:", e);
    res.status(500).json({ error: "Failed to fetch workspaces." });
  }
};

exports.get = async (req, res) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id, {
      include: [
        {
          model: Article,
          as: "Articles",
          include: [
            { model: Comment, as: "Comments" },
            { model: Attachment, as: "Attachments" },
          ],
        },
      ],
    });
    if (!workspace)
      return res.status(404).json({ error: "Workspace not found." });
    res.json(workspace);
  } catch (e) {
    console.error("Error fetching workspace:", e);
    res.status(500).json({ error: "Failed to fetch workspace." });
  }
};

exports.create = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Workspace name is required." });
  }
  try {
    const workspace = await Workspace.create({ name });
    res.status(201).json(workspace);
  } catch (e) {
    console.error("Error creating workspace:", e);
    res.status(500).json({ error: "Failed to create workspace." });
  }
};

exports.update = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Workspace name is required." });
  }
  try {
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace)
      return res.status(404).json({ error: "Workspace not found." });
    workspace.name = name;
    await workspace.save();
    res.json(workspace);
  } catch (e) {
    console.error("Error updating workspace:", e);
    res.status(500).json({ error: "Failed to update workspace." });
  }
};

exports.delete = async (req, res) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace)
      return res.status(404).json({ error: "Workspace not found." });
    await workspace.destroy();
    res.json({ message: "Workspace deleted." });
  } catch (e) {
    console.error("Error deleting workspace:", e);
    res.status(500).json({ error: "Failed to delete workspace." });
  }
};
