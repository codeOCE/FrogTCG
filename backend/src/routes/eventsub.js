const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fetch = require("node-fetch");

require("dotenv").config();

// -----------------------------
// ENV VARS
// -----------------------------
const CALLBACK_URL = process.env.CALLBACK_URL;   // e.g. https://backend.codeoce.com/eventsub/callback
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const EVENTSUB_SECRET = process.env.TWITCH_EVENTSUB_SECRET || crypto.randomBytes(16).toString("hex");

// -----------------------------
// VERIFY TWITCH SIGNATURE
// -----------------------------
function verifySignature(req) {
  const messageId = req.headers["twitch-eventsub-message-id"];
  const timestamp = req.headers["twitch-eventsub-message-timestamp"];
  const signature = req.headers["twitch-eventsub-message-signature"];
  const bodyStr = JSON.stringify(req.body);

  const computed = "sha256=" +
    crypto
      .createHmac("sha256", EVENTSUB_SECRET)
      .update(messageId + timestamp + bodyStr)
      .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computed)
    );
  } catch (e) {
    return false;
  }
}

// -----------------------------
// GET APP ACCESS TOKEN
// -----------------------------
async function getAppToken() {
  console.log("🔑 Getting Twitch App Token...");

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: params
  });

  const json = await res.json();

  if (!json.access_token) {
    console.error("❌ Failed to acquire token:", json);
    throw new Error("Could not fetch Twitch app token");
  }

  console.log("✅ Token OK");
  return json.access_token;
}

// ------------------------------------------------------
// SUBSCRIBE HANDLER (used by both GET & POST)
// ------------------------------------------------------
async function registerEventSub(req, res) {
  try {
    console.log("🚀 Registering EventSub webhook...");
    const token = await getAppToken();

    const payload = {
      type: "channel.channel_points_custom_reward_redemption.add",
      version: "1",
      condition: {
        broadcaster_user_id: process.env.TWITCH_BROADCASTER_ID
      },
      transport: {
        method: "webhook",
        callback: CALLBACK_URL,
        secret: EVENTSUB_SECRET
      }
    };

    console.log("📨 Sending subscription request:", payload);

    const twitchRes = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
      method: "POST",
      headers: {
        "Client-ID": CLIENT_ID,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const json = await twitchRes.json();
    console.log("📡 Twitch Response:", json);

    return res.json(json);

  } catch (err) {
    console.error("❌ EventSub Registration Failed:", err);
    return res.status(500).json({ error: err.message });
  }
}

// ------------------------------------------------------
// ROUTES
// ------------------------------------------------------

// Allow browser test page to manually trigger
router.get("/subscribe", (req, res) => {
  console.log("📌 GET /eventsub/subscribe → calling registerEventSub()");
  registerEventSub(req, res);
});

// API clients should call POST
router.post("/subscribe", registerEventSub);

// ------------------------------------------------------
// CALLBACK HANDLER
// ------------------------------------------------------
router.post("/callback", express.json(), (req, res) => {
  const type = req.headers["twitch-eventsub-message-type"];

  console.log("📥 Incoming EventSub:", type);

  // Verification challenge
  if (type === "webhook_callback_verification") {
    console.log("🔗 EventSub Verified!");
    return res.status(200).send(req.body.challenge);
  }

  // Validate signature
  if (!verifySignature(req)) {
    console.log("❌ INVALID SIGNATURE — Rejecting");
    return res.sendStatus(403);
  }

  // Notification event
  if (type === "notification") {
    const event = req.body.event;
    console.log("🎉 EVENT RECEIVED:", event);

    // TODO: Broadcast over WebSockets for pack opening
    // const { broadcast } = require("../realtime/wsServer");
    // broadcast(event);

    return res.sendStatus(200);
  }

  return res.sendStatus(200);
});

module.exports = router;
