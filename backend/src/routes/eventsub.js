const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fetch = require("node-fetch");

require("dotenv").config();

const CALLBACK_URL = process.env.CALLBACK_URL; // https://codeoce.com/eventsub/callback
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const EVENTSUB_SECRET = process.env.EVENTSUB_SECRET || crypto.randomBytes(16).toString("hex");


// --------------------------------------------------
// 0. REQUIRED: GET /callback  (fixes your 404 problem)
// --------------------------------------------------
router.get("/callback", (req, res) => {
  return res.status(200).send("OK");
});


// --------------------------------------------------
// 1. Get Twitch App Token
// --------------------------------------------------
async function getAppToken() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "client_credentials"
  });

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: params
  });

  const data = await res.json();

  if (!data.access_token) {
    console.error("❌ Failed to get Twitch app token:", data);
    throw new Error("Failed to get token");
  }

  return data.access_token;
}


// --------------------------------------------------
// 2. Create EventSub Subscription
// --------------------------------------------------
router.post("/subscribe", async (req, res) => {
  try {
    console.log("🚀 Requesting Twitch App Token...");
    const token = await getAppToken();

    console.log("📨 Creating EventSub subscription...");

    const response = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
      method: "POST",
      headers: {
        "Client-ID": CLIENT_ID,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "channel.channel_points_custom_reward_redemption.add",
        version: "1",
        condition: { broadcaster_user_id: process.env.TWITCH_BROADCASTER_ID },
        transport: {
          method: "webhook",
          callback: CALLBACK_URL,  // must be HTTPS
          secret: EVENTSUB_SECRET
        }
      })
    });

    const json = await response.json();
    console.log("📡 Twitch Response:", json);

    return res.json(json);

  } catch (err) {
    console.error("❌ EventSub Register Error:", err);
    return res.status(500).json({ error: "EventSub registration failed", details: err });
  }
});


// --------------------------------------------------
// 3. EventSub Callback (Verification + Notifications)
// --------------------------------------------------
router.post("/callback", express.json(), (req, res) => {
  const msgType = req.headers["twitch-eventsub-message-type"];

  // STEP 1 — VERIFICATION
  if (msgType === "webhook_callback_verification") {
    console.log("🔗 EventSub Verified!");
    return res.status(200).send(req.body.challenge);
  }

  // STEP 2 — NOTIFICATION
  if (msgType === "notification") {
    console.log("🎉 EVENT RECEIVED:", req.body.event);

    // (Broadcast to OBS overlay later)
    return res.sendStatus(200);
  }

  return res.sendStatus(200);
});


module.exports = router;
