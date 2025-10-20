const path = require("path");

const LOGS_ROOT = path.join(__dirname, "./logs");
const LOG_TYPES = ["success", "error", "warning"];

module.exports = {
  LOGS_ROOT,
  LOG_TYPES,
};