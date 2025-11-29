require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const startWs = require('./realtime/wsServer');

const app = express();

// CORS — must allow your frontend explicitly for cookies to work
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Parse JSON bodies
app.use(bodyParser.json());

// Cookie-based sessions
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'devsecret'],
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  sameSite: 'lax',             // Important for OAuth redirect
  secure: false                // Set to true ONLY in production HTTPS
}));

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

// Websocket server
startWs(server);
