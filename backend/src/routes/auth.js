const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const {
  twitchAuthUrl,
  exchangeCodeForToken,
  getTwitchUser
} = require('../lib/twitch');

// STEP 1 — Redirect user to Twitch login
router.get('/login', (req, res) => {
  res.redirect(twitchAuthUrl());
});

// STEP 2 — Handle callback from Twitch
router.get('/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("No code provided");

    const tokenData = await exchangeCodeForToken(code);
    const twitchUser = await getTwitchUser(tokenData.access_token);

    // Save or update user in DB
    const user = await prisma.user.upsert({
      where: { twitchId: twitchUser.id },
      update: {
        displayName: twitchUser.display_name,
        profileImage: twitchUser.profile_image_url,
        lastActive: new Date(),
      },
      create: {
        twitchId: twitchUser.id,
        displayName: twitchUser.display_name,
        profileImage: twitchUser.profile_image_url,
      }
    });

    // Create session
    req.session.user = {
      id: user.id,
      twitchId: user.twitchId,
      displayName: user.displayName,
    };

    // Redirect to frontend dashboard
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/dashboard');

  } catch (err) {
    console.error(err);
    res.status(500).send("Authentication failed");
  }
});

// STEP 3 — Return logged-in user info
router.get('/me', async (req, res) => {
  if (!req.session.user) return res.json({ loggedIn: false });

  const user = await prisma.user.findUnique({
    where: { id: req.session.user.id }
  });

  return res.json({
    loggedIn: true,
    user
  });
});

module.exports = router;
