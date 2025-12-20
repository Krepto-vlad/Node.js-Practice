const express = require("express");

const router = express.Router();
const workspacesController = require("../controllers/workspacesController");

router.get("/", workspacesController.list);
router.get("/:id", workspacesController.get);
router.post("/", workspacesController.create);
router.put("/:id", workspacesController.update);
router.delete("/:id", workspacesController.delete);

module.exports = router;
