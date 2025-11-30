const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fetch = require("node-fetch");

require("dotenv").config();

const CALLBACK_URL = process.env.CALLBACK_URL; // https://codeoce.com/eventsub/callback
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const EVENTSUB_SECRET = process.env.EVENTSUB_SECRET || crypto.randomBytes(16).toString("hex");

// -----------------------------
// Verify Twitch Signature
// -----------------------------
function verifySignature(req) {
  const messageId = req.headers["twitch-eventsub-message-id"];
  const timestamp = req.headers["twitch-eventsub-message-timestamp"];
  const signature = req.headers["twitch-eventsub-message-signature"];

  const hmacMessage = messageId + timestamp + JSON.stringify(req.body);
  const computed = "sha256=" +
    crypto
      .createHmac("sha256", EVENTSUB_SECRET)
      .update(hmacMessage)
      .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
}

// -----------------------------
// 1. GET APP ACCESS TOKEN
// -----------------------------
async function getAppToken() {
  const url = `https://id.twitch.tv/oauth2/token`;

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const res = await fetch(url, { method: "POST", body: params });
  const data = await res.json();

  if (!data.access_token) {
    console.error("❌ Failed to get Twitch app token:", data);
    throw new Error("Unable to get token");
  }

  return data.access_token;
}

// -----------------------------
// 2. CREATE EVENTSUB SUB
// -----------------------------
router.post("/subscribe", async (req, res) => {
  try {
    console.log("🚀 Requesting Twitch app token...");
    const token = await getAppToken();

    console.log("📨 Creating EventSub subscription...");

    const sub = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
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
          callback: CALLBACK_URL,     // MUST BE HTTPS 443
          secret: EVENTSUB_SECRET
        }
      }),
    });

    const response = await sub.json();
    console.log("📡 Twitch Response:", response);

    res.json(response);
  } catch (err) {
    console.error("❌ EventSub Register Error:", err);
    res.status(500).json({ error: "EventSub registration failed", details: err });
  }
});

// -----------------------------
// 3. EVENTSUB CALLBACK HANDLER
// -----------------------------
router.post("/callback", express.json(), async (req, res) => {
  const messageType = req.headers["twitch-eventsub-message-type"];

  // Challenge
  if (messageType === "webhook_callback_verification") {
    console.log("🔗 EventSub Verified!");
    return res.status(200).send(req.body.challenge);
  }

  // Signature Check
  if (!verifySignature(req)) {
    console.log("❌ Invalid EventSub signature");
    return res.sendStatus(403);
  }

  // Ping
  if (messageType === "notification") {
    const event = req.body.event;
    console.log("🎉 EVENT RECEIVED:", event);

    // Here you would broadcast through WebSockets
    // require("../realtime/wsServer").broadcast(...)

    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

module.exports = router;
