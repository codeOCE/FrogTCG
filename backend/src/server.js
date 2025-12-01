// src/backend/src/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const path = require("path");

const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
const adminRoutes = require("./routes/admin");
const eventsubRoutes = require("./routes/eventsub");

const { startWs } = require("./realtime/wsServer");

const app = express();

// ---------------------
// CORS
// ---------------------
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ---------------------
// Body parsing
// ---------------------
app.use(bodyParser.json());

// ---------------------
// Cookie session
// ---------------------
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "dev_secret"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// ---------------------
// Serve static overlay files
// ---------------------
app.use(express.static(path.join(__dirname, "..", "public")));

// ---------------------
// Routes
// ---------------------
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);

// IMPORTANT — MUST BE BEFORE 404s
app.use("/eventsub", eventsubRoutes);

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`🌍 Public URL: ${process.env.PUBLIC_URL}`);
});

startWs(server);

module.exports = app;
