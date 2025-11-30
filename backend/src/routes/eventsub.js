const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Verify Webhook Callback URL
router.get("/callback", (req, res) => {
  const msg = req.headers["twitch-eventsub-message-type"];

  if (msg === "webhook_callback_verification") {
    console.log("🔗 EventSub: Verification challenge received");
    return res.status(200).send(req.body.challenge);
  }

  return res.sendStatus(200);
});

// MAIN EventSub Handler
router.post("/callback", express.json({ type: "*/*" }), async (req, res) => {
  const messageType = req.headers["twitch-eventsub-message-type"];

  if (messageType === "notification") {
    const event = req.body.event;

    console.log("🎉 EVENT RECEIVED:", event);

    // Example: channel points redemption → trigger pack opening
    if (event.reward && event.reward.title.toLowerCase().includes("pack")) {
      // Trigger WebSocket broadcast etc
      console.log(`🚨 PACK REDEEMED BY ${event.user_name}`);
    }
  }

  res.sendStatus(200);
});

// REGISTER EventSub Subscription
router.get("/register", async (req, res) => {
  try {
    console.log("🔑 Requesting Twitch app token...");

    const tokenResp = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: "POST" }
    );

    const tokenData = await tokenResp.json();

    if (!tokenData.access_token) {
      return res.status(500).json({ error: "Failed to get token", data: tokenData });
    }

    const APP_TOKEN = tokenData.access_token;

    console.log("📡 Creating EventSub subscription...");

    const body = {
      type: "channel.channel_points_custom_reward_redemption.add",
      version: "1",
      condition: {
        broadcaster_user_id: process.env.TWITCH_USER_ID
      },
      transport: {
        method: "webhook",
        callback: `${process.env.PUBLIC_URL}/eventsub/callback`,
        secret: process.env.EVENTSUB_SECRET
      }
    };

    const eventResp = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
      method: "POST",
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        "Authorization": `Bearer ${APP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const eventData = await eventResp.json();
    console.log("📨 Twitch Response:", eventData);

    return res.json({
      message: "EventSub registration attempted. Check logs.",
      twitch: eventData
    });

  } catch (err) {
    console.error("❌ EventSub Register Error:", err);
    res.status(500).json({ error: "EventSub registration failed" });
  }
});

module.exports = router;
