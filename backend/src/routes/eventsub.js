const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fetch = require("node-fetch");
const { PrismaClient } = require("@prisma/client");
const { broadcast } = require("../realtime/wsServer");

require("dotenv").config();

const prisma = new PrismaClient();

const CALLBACK_URL = process.env.CALLBACK_URL;
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

const EVENTSUB_SECRET = process.env.EVENTSUB_SECRET ||
  crypto.randomBytes(16).toString("hex");

// Verify Twitch signature
function verifySignature(req) {
  const messageId = req.headers["twitch-eventsub-message-id"];
  const timestamp = req.headers["twitch-eventsub-message-timestamp"];
  const signature = req.headers["twitch-eventsub-message-signature"];

  const hmacMessage = messageId + timestamp + JSON.stringify(req.body);

  const computedSignature = "sha256=" +
    crypto
      .createHmac("sha256", EVENTSUB_SECRET)
      .update(hmacMessage)
      .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

// Get app token
async function getAppToken() {
  const res = await fetch(`https://id.twitch.tv/oauth2/token`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    })
  });

  return (await res.json()).access_token;
}

// Create subscription
router.post("/subscribe", async (req, res) => {
  try {
    const token = await getAppToken();

    const response = await fetch(
      "https://api.twitch.tv/helix/eventsub/subscriptions",
      {
        method: "POST",
        headers: {
          "Client-ID": CLIENT_ID,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "channel.channel_points_custom_reward_redemption.add",
          version: "1",
          condition: {
            broadcaster_user_id: process.env.TWITCH_BROADCASTER_ID
          },
          transport: {
            method: "webhook",
            callback: CALLBACK_URL,
            secret: EVENTSUB_SECRET,
          }
        })
      }
    );

    res.json(await response.json());
  } catch (err) {
    console.error("EventSub subscribe error:", err);
    res.status(500).json({ error: "Failed" });
  }
});

// -------------------------------------------
// CALLBACK — Twitch sends all reward events here
// -------------------------------------------
router.post("/callback", express.json(), async (req, res) => {
  const messageType = req.headers["twitch-eventsub-message-type"];

  // 1 — VERIFY CHALLENGE
  if (messageType === "webhook_callback_verification") {
    console.log("EventSub Verified.");
    return res.status(200).send(req.body.challenge);
  }

  // 2 — VERIFY SIGNATURE
  if (!verifySignature(req)) {
    console.log("Invalid signature.");
    return res.sendStatus(403);
  }

  // 3 — HANDLE EVENTS
  if (messageType === "notification") {
    const event = req.body.event;

    console.log("🎯 Received redemption:", event);

    const twitchId = event.user_id;
    const rewardTitle = event.reward.title;

    // ONLY trigger pack opening for specific reward name
    if (rewardTitle.toLowerCase().includes("TEST")) {
      console.log("🎉 Booster Pack Redemption detected for", twitchId);

      let user = await prisma.user.findUnique({
        where: { twitchId }
      });

      if (!user) {
        console.log("⚠ No user found in DB. Skipping.");
        return res.sendStatus(200);
      }

      // ---------------------------------------------
      //  🔥 TRIGGER CARD PACK OPEN
      // ---------------------------------------------
      const rarityWeights = {
        common: 70,
        uncommon: 20,
        rare: 8,
        epic: 2
      };

      function rollRarity() {
        const total = Object.values(rarityWeights).reduce((a, b) => a + b);
        let r = Math.random() * total;
        for (const key in rarityWeights) {
          r -= rarityWeights[key];
          if (r <= 0) return key;
        }
        return "common";
      }

      const rarity = rollRarity();

      const cards = await prisma.card.findMany({
        where: { rarity }
      });

      if (!cards || cards.length === 0) {
        console.log("⚠ No cards found for rarity:", rarity);
        return res.sendStatus(200);
      }

      const card = cards[Math.floor(Math.random() * cards.length)];

      await prisma.ownedCard.create({
        data: {
          userId: user.id,
          cardId: card.id
        }
      });

      // ---------------------------------------------
      //  🔥 SEND WS EVENT TO OBS OVERLAY
      // ---------------------------------------------
      broadcast({
        type: "PACK_OPENED",
        user: user.displayName,
        card: {
          name: card.name,
          rarity: card.rarity,
          imageUrl: card.imageUrl
        }
      });

      console.log("💥 Pack opened + broadcast sent");
    }

    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

module.exports = router;
