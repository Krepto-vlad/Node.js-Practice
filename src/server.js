require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const cors = require("cors");
const fs = require("fs");
const { ATTACHMENTS_DIR } = require("./constants");
const articlesRoutes = require("./routes/articles");
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");
const healthCheck = require("./utils/healthCheck");
const workspacesRoutes = require("./routes/workspaces");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3333;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use("/attachments", cors(), express.static(ATTACHMENTS_DIR));
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(rateLimiter);

fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });

io.on("connection", (socket) => {
  console.log("WebSocket client connected:", socket.id);
});

app.use((req, res, next) => {
  res.notify = (event, data) => {
    console.log("Emitting event:", event, data);
    io.emit(event, data);
  };
  next();
});

app.use("/workspaces", workspacesRoutes);

app.get("/health", healthCheck);

app.use("/articles", articlesRoutes);

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
