const express = require("express");
const router = express.Router({ mergeParams: true });
const commentsController = require("../controllers/commentsController");

router.get("/", commentsController.list);
router.post("/", commentsController.create);
router.put("/:id", commentsController.update);
router.delete("/:id", commentsController.delete);

module.exports = router;
