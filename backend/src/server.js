require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const path = require("path");

// Routes
app.use("/eventsub", require("./routes/eventsub"));
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
const adminRoutes = require("./routes/admin");
const { subscribeToPointsRedemption } = require("./lib/eventsub");

subscribeToPointsRedemption();


// WebSocket server
const { startWs } = require("./realtime/wsServer");

const app = express();

// 🔥 Serve static OBS overlay files FIRST
const publicPath = path.join(__dirname, "..", "public");
console.log("SERVING STATIC FROM:", publicPath);
app.use(express.static(publicPath));

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Body parsing
app.use(bodyParser.json());

// Session cookies
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "dev_secret"],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  })
);

// Mount routes (AFTER static middleware)
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);

// Server start
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

// Start WebSocket server
startWs(server);
