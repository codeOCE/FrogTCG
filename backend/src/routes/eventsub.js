const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

require("dotenv").config();

const CALLBACK_URL = process.env.CALLBACK_URL; 
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const EVENTSUB_SECRET = process.env.TWITCH_EVENTSUB_SECRET;
const BROADCASTER_ID = process.env.TWITCH_BROADCASTER_ID;

// --------------------------------------------------
// Verify Twitch HMAC Signature
// --------------------------------------------------
function verifySignature(req) {
  const messageId = req.headers["twitch-eventsub-message-id"];
  const timestamp = req.headers["twitch-eventsub-message-timestamp"];
  const signature = req.headers["twitch-eventsub-message-signature"];

  if (!messageId || !timestamp || !signature) return false;

  const body = JSON.stringify(req.body);
  const message = messageId + timestamp + body;

  const computed = 
    "sha256=" +
    crypto.createHmac("sha256", EVENTSUB_SECRET)
      .update(message)
      .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computed)
  );
}

// --------------------------------------------------
// GET APP ACCESS TOKEN
// --------------------------------------------------
async function getAppToken() {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  const data = await res.json();

  if (!data.access_token) {
    console.error("❌ Failed to get app token:", data);
    throw new Error("NO_TOKEN");
  }

  return data.access_token;
}

// --------------------------------------------------
// SUBSCRIBE TO EVENTSUB
// --------------------------------------------------
router.post("/subscribe", express.json(), async (req, res) => {
  try {
    console.log("📡 Registering EventSub webhook...");
    const token = await getAppToken();

    const response = await fetch(
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
          condition: { broadcaster_user_id: BROADCASTER_ID },
          transport: {
            method: "webhook",
            callback: CALLBACK_URL,          // must be https+443
            secret: EVENTSUB_SECRET,
          },
        }),
      }
    );

    const json = await response.json();
    console.log("🔍 Twitch Response:", json);

    return res.json(json);

  } catch (err) {
    console.error("❌ EventSub Registration Failed:", err);
    return res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------
// TWITCH CALLBACK HANDLER
// --------------------------------------------------
router.post("/callback", express.json(), (req, res) => {
  const type = req.headers["twitch-eventsub-message-type"];

  // Verify HMAC
  if (!verifySignature(req)) {
    console.log("❌ Invalid signature");
    return res.sendStatus(403);
  }

  // Challenge
  if (type === "webhook_callback_verification") {
    console.log("🔗 Verified by Twitch");
    return res.status(200).send(req.body.challenge);
  }

  // Notification event
  if (type === "notification") {
    const event = req.body.event;
    console.log("🎉 Event Received:", event);
    return res.sendStatus(200);
  }

  return res.sendStatus(200);
});

// --------------------------------------------------
module.exports = router;
