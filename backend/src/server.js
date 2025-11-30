require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const path = require("path");

// Routes
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
const adminRoutes = require("./routes/admin");
const eventsubRoutes = require("./routes/eventsub");

// WebSocket server
const { startWs } = require("./realtime/wsServer");

const app = express();

/* ---------------------------------------------
   CORS
--------------------------------------------- */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* ---------------------------------------------
   Body Parsing
--------------------------------------------- */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ---------------------------------------------
   Session Cookies
--------------------------------------------- */
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "dev_secret"],
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax",
  })
);

/* ---------------------------------------------
   Static Public Folder (for OBS overlays)
--------------------------------------------- */
app.use(express.static(path.join(__dirname, "..", "public")));

/* ---------------------------------------------
   Mount Routes
--------------------------------------------- */
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/admin", adminRoutes);
app.use("/eventsub", eventsubRoutes);   // *** REQUIRED FOR TWITCH EVENTSUB ***

/* ---------------------------------------------
   Root Response
--------------------------------------------- */
app.get("/", (req, res) => {
  res.send("FrogTCG Backend Running 🐸");
});

/* ---------------------------------------------
   Start Server
--------------------------------------------- */
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
  console.log(`🌐 Public URL: ${process.env.PUBLIC_URL}`);
});

/* ---------------------------------------------
   WebSocket Overlay Server
--------------------------------------------- */
startWs(server);

module.exports = app;
