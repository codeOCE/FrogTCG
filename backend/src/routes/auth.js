const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const prisma = require("../lib/prisma");

require("dotenv").config();

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const REDIRECT_URI = process.env.TWITCH_REDIRECT_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;

// ---------------------------------------------------------------------------
// STEP 1 — Redirect user to Twitch login
// ---------------------------------------------------------------------------
router.get("/login", (req, res) => {
  const scope = [
    "user:read:email",
    "channel:read:redemptions",
    "channel:manage:redemptions"
  ].join("+");

  const twitchAuthUrl =
    `https://id.twitch.tv/oauth2/authorize?` +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${scope}`;

  return res.redirect(twitchAuthUrl);
});

// ---------------------------------------------------------------------------
// STEP 2 — Twitch redirects back here with ?code=xxxx
// ---------------------------------------------------------------------------
router.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    console.log("⚠ No code provided to /auth/callback");
    return res.status(400).send("No code provided");
  }

  try {
    // Exchange code for OAuth tokens
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.log("❌ Error fetching Twitch token:", tokenData);
      return res.status(500).send("Failed to exchange code for token.");
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // -----------------------------------------------------------------------
    // STEP 3 — Get user info from Twitch
    // -----------------------------------------------------------------------
    const userRes = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        "Client-ID": CLIENT_ID,
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const userData = await userRes.json();
    const twitchUser = userData.data?.[0];

    if (!twitchUser) {
      console.log("❌ Error retrieving Twitch user:", userData);
      return res.status(500).send("Could not retrieve Twitch user.");
    }

    // -----------------------------------------------------------------------
    // STEP 4 — Store user in database
    // -----------------------------------------------------------------------
    const user = await prisma.user.upsert({
      where: { twitchId: twitchUser.id },
      update: {
        displayName: twitchUser.display_name,
        profileImage: twitchUser.profile_image_url,
        accessToken,
        refreshToken,
      },
      create: {
        twitchId: twitchUser.id,
        displayName: twitchUser.display_name,
        profileImage: twitchUser.profile_image_url,
        accessToken,
        refreshToken,
      },
    });

    // -----------------------------------------------------------------------
    // STEP 5 — Save session + redirect to admin dashboard
    // -----------------------------------------------------------------------
    req.session.userId = user.id;

    console.log("✅ Logged in:", user.displayName);

    return res.redirect("https://codeoce.com/dashboard");

  } catch (err) {
    console.error("❌ Auth callback error:", err);
    return res.status(500).send("Authentication error.");
  }
});

module.exports = router;
