require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const path = require("path");

const { startWs } = require("./realtime/wsServer");

// Create express app FIRST
const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(cookieSession({
  name: "session",
  keys: [process.env.SESSION_SECRET || "dev_secret"],
  maxAge: 24 * 60 * 60 * 1000
}));

// Static files
app.use(express.static(path.join(__dirname, "..", "public")));

// Routes (AFTER app exists)
app.use("/auth", require("./routes/auth"));
app.use("/api", require("./routes/api"));
app.use("/admin", require("./routes/admin"));
app.use("/eventsub", require("./routes/eventsub"));   // <-- FIXED ORDER

// Root test route
app.get("/", (req, res) => {
  res.send("FrogTCG backend running.");
});

// Start HTTP server
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

// WebSockets
startWs(server);
