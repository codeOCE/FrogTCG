const express = require("express");
const crypto = require("crypto");
const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), (req, res) => {
  const messageType = req.header("Twitch-Eventsub-Message-Type");

  // Verify signature
  const hmac = crypto.createHmac("sha256", process.env.TWITCH_EVENTSUB_SECRET);
  const messageId = req.header("Twitch-Eventsub-Message-Id");
  const timestamp = req.header("Twitch-Eventsub-Message-Timestamp");

  const signature = req.header("Twitch-Eventsub-Message-Signature");
  const body = req.body.toString();
  const message = messageId + timestamp + body;
  const expectedSignature = "sha256=" + hmac.update(message).digest("hex");

  if (expectedSignature !== signature) {
    return res.status(403).send("Invalid signature");
  }

  // Handle challenge
  if (messageType === "webhook_callback_verification") {
    const challenge = JSON.parse(body).challenge;
    return res.status(200).send(challenge);
  }

  // Handle notifications
  if (messageType === "notification") {
    const event = JSON.parse(body).event;

    console.log("🔔 RECEIVED EVENTSUB:", event);

    // TODO: trigger pack opening or whatever event
  }

  res.status(200).send("OK");
});

module.exports = router;
