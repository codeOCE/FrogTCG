const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const router = express.Router();

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const REDIRECT_URI = process.env.TWITCH_REDIRECT_URI;

// -----------------------------------------
// 1. REDIRECT USER TO TWITCH LOGIN
// -----------------------------------------
router.get("/login", (req, res) => {
  const scopes = [
    "user:read:email",
    "channel:read:redemptions",
    "channel:manage:redemptions"
  ].join("+");

  const url = `https://id.twitch.tv/oauth2/authorize
?client_id=${CLIENT_ID}
&redirect_uri=${encodeURIComponent(REDIRECT_URI)}
&response_type=code
&scope=${scopes}`.replace(/\n/g, "");

  res.redirect(url);
});

// -----------------------------------------
// 2. HANDLE TWITCH REDIRECT + SAVE TOKEN
// -----------------------------------------
router.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("No code provided.");
  }

  // Exchange code for user token
  const tokenRes = await fetch(`https://id.twitch.tv/oauth2/token`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI
    })
  });

  const tokenData = await tokenRes.json();
  console.log("Twitch OAuth Token Response:", tokenData);

  if (!tokenData.access_token) {
    return res.status(500).send("Failed to get user access token.");
  }

  // ⚠️ IMPORTANT: Save this broadcaster token in your Render env manually
  console.log("⭐ SAVE THIS AS BROADCASTER_USER_TOKEN:");
  console.log(tokenData.access_token);

  res.send(`
    <h1>Broadcaster Token Retrieved</h1>
    <p>Copy this and add it to your Render environment as:</p>
    <pre>BROADCASTER_USER_TOKEN=${tokenData.access_token}</pre>
  `);
});

module.exports = router;
