// src/backend/src/routes/eventsub.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fetch = require("node-fetch");

require("dotenv").config();

// -----------------------------
// ENV VALUES
// -----------------------------
const CALLBACK_URL = process.env.CALLBACK_URL; // https://backend.codeoce.com/eventsub/callback
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const BROADCASTER_ID = process.env.TWITCH_BROADCASTER_ID;
const EVENTSUB_SECRET = process.env.TWITCH_EVENTSUB_SECRET;

// -----------------------------
// HMAC Signature Verification
// -----------------------------
function verifySignature(req) {
  try {
    const messageId = req.headers["twitch-eventsub-message-id"];
    const timestamp = req.headers["twitch-eventsub-message-timestamp"];
    const signature = req.headers["twitch-eventsub-message-signature"];

    const message =
      messageId + timestamp + JSON.stringify(req.body);

    const computedSignature =
      "sha256=" +
      crypto
        .createHmac("sha256", EVENTSUB_SECRET)
        .update(message)
        .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  } catch (err) {
    console.log("❌ Signature verification failed", err);
    return false;
  }
}

// -----------------------------
// Get App Access Token
// -----------------------------
async function getAppToken() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: params,
  });

  const data = await res.json();

  if (!data.access_token) {
    console.error("❌ Failed to get Twitch app token:", data);
    throw new Error("No access token returned");
  }

  return data.access_token;
}

// -----------------------------
// GET Handler — required by Twitch
// -----------------------------
router.get("/callback", (req, res) => {
  console.log("⚡ GET /eventsub/callback — OK");
  res.status(200).send("OK");
});

// -----------------------------
// POST Handler — EventSub callback
// -----------------------------
router.post("/callback", express.json(), async (req, res) => {
  const messageType = req.headers["twitch-eventsub-message-type"];

  // Verification challenge
  if (messageType === "webhook_callback_verification") {
    console.log("🔗 EventSub verified!");
    return res.status(200).send(req.body.challenge);
  }

  // Validate signature
  if (!verifySignature(req)) {
    console.log("❌ Invalid EventSub signature");
    return res.sendStatus(403);
  }

  if (messageType === "notification") {
    console.log("🎉 EVENT RECEIVED:", req.body.event);
    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

// -----------------------------
// Create EventSub Subscription
// -----------------------------
router.post("/subscribe", async (req, res) => {
  try {
    console.log("🚀 Requesting Twitch app token...");
    const token = await getAppToken();

    console.log("📨 Creating EventSub subscription...");

    const sub = await fetch(
      "https://api.twitch.tv/helix/eventsub/subscriptions",
      {
        method: "POST",
        headers: {
          "Client-ID": CLIENT_ID,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "channel.channel_points_custom_reward_redemption.add",
          version: "1",
          condition: {
            broadcaster_user_id: BROADCASTER_ID,
          },
          transport: {
            method: "webhook",
            callback: CALLBACK_URL,
            secret: EVENTSUB_SECRET,
          },
        }),
      }
    );

    const response = await sub.json();
    console.log("📡 Twitch Response:", response);

    res.json(response);
  } catch (err) {
    console.error("❌ EventSub Register Error:", err);
    res.status(500).json({
      error: "EventSub registration failed",
      details: err.toString(),
    });
  }
});

module.exports = router;
