// backend/src/routes/auth.js
const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client"); // ✅ your original working Prisma
const prisma = new PrismaClient();

require("dotenv").config();

const {
  twitchAuthUrl,
  exchangeCodeForToken,
  getTwitchUser,
} = require("../lib/twitch");

// STEP 1 — Redirect user to Twitch login
router.get("/login", (req, res) => {
  res.redirect(twitchAuthUrl());
});

// STEP 2 — Handle callback from Twitch
router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("No code provided");

    // Exchange Twitch OAuth code
    const tokenData = await exchangeCodeForToken(code);
    const twitchUser = await getTwitchUser(tokenData.access_token);

    // ⭐ If this is your broadcaster account, log token for EventSub
    if (
      process.env.TWITCH_BROADCASTER_ID &&
      twitchUser.id === process.env.TWITCH_BROADCASTER_ID
    ) {
      console.log("⭐ Broadcaster logged in via OAuth");
      console.log(
        "➡️  Add this to Render as BROADCASTER_USER_TOKEN:\n",
        tokenData.access_token
      );
    }

    // Create or update user in DB
    const user = await prisma.user.upsert({
      where: { twitchId: twitchUser.id },
      update: {
        displayName: twitchUser.display_name,
        profileImage: twitchUser.profile_image_url,
      },
      create: {
        twitchId: twitchUser.id,
        displayName: twitchUser.display_name,
        profileImage: twitchUser.profile_image_url,
      },
    });

    // Store session
    req.session.user = {
      id: user.id,
      twitchId: user.twitchId,
      displayName: user.displayName,
    };

    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173/dashboard");
  } catch (err) {
    console.error("Auth callback error:", err);
    res.status(500).send("Authentication failed");
  }
});

// Return session user
router.get("/me", async (req, res) => {
  if (!req.session.user) return res.json({ loggedIn: false });

  const user = await prisma.user.findUnique({
    where: { id: req.session.user.id },
  });

  return res.json({ loggedIn: true, user });
});

module.exports = router;
