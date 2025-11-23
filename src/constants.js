const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const ATTACHMENTS_DIR = path.join(__dirname, "data", "attachments");
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES_PER_UPLOAD = 10;

module.exports = {
  DATA_DIR,
  ATTACHMENTS_DIR,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_PER_UPLOAD,
};
