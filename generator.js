const fs = require("fs").promises;
const path = require("path");
const readline = require("readline");
const Logger = require("./logger");
const { LOGS_ROOT, LOG_TYPES } = require("./constants");

async function checkDirExistence(dir) { 
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    console.error("Error creating folder:", e.message);
  }
}

async function startGenerator() {
  let currentMinuteDir = "";

  async function updateMinuteDir() {
    const minute = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16);
    currentMinuteDir = path.join(LOGS_ROOT, minute);
    await checkDirExistence(currentMinuteDir);
  }

  await checkDirExistence(LOGS_ROOT);
  await updateMinuteDir();
  setInterval(updateMinuteDir, 60 * 1000);

  setInterval(async () => {
    if (!currentMinuteDir) return;

    const logger = new Logger(currentMinuteDir);
    const type = LOG_TYPES[Math.floor(Math.random() * LOG_TYPES.length)];
    const entry = await logger.log(type);
    const filename = `log-${Date.now()}.log`;

    try {
      await fs.writeFile(
        path.join(currentMinuteDir, filename),
        JSON.stringify(entry) + "\n"
      );
    } catch (e) {
      console.error("Error writing log:", e.message);
    }
  }, 10 * 1000);

  console.log('Log Generator started! To stop, type "exit" or press Ctrl+C');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on("line", (input) => {
    if (input.trim().toLowerCase() === "exit") {
      console.log("Stopping the log generator. Bye!");
      process.exit(0);
    }
  });
}

startGenerator().catch((e) => {
  console.error("Critical error:", e.message);
});
