const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { broadcast } = require("../realtime/wsServer");

/* -------------------------------------------------------
   RARITY WEIGHTS
------------------------------------------------------- */
const RARITY_WEIGHTS = {
  common: 70,
  uncommon: 20,
  rare: 8,
  epic: 2,
};

// Weighted rarity roll
function getRandomRarity() {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;

  for (const r in RARITY_WEIGHTS) {
    roll -= RARITY_WEIGHTS[r];
    if (roll <= 0) return r;
  }

  return "common";
}

/* -------------------------------------------------------
   OPEN PACK
------------------------------------------------------- */
router.post("/packs/open", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not logged in" });

  try {
    const userId = req.session.user.id;

    const rarity = getRandomRarity();

    const candidates = await prisma.card.findMany({
      where: { rarity },
    });

    if (candidates.length === 0) {
      return res.status(500).json({
        error: `No cards with rarity ${rarity}. Add more cards to your DB.`,
      });
    }

    const card =
      candidates[Math.floor(Math.random() * candidates.length)];

    const owned = await prisma.ownedCard.create({
      data: {
        userId,
        cardId: card.id,
      },
      include: {
        card: true,
      },
    });

    // Send to OBS overlay
    broadcast({
      type: "PACK_OPENED",
      user: req.session.user.displayName,
      rarity: card.rarity,
      card: {
        id: card.id,
        name: card.name,
        rarity: card.rarity,
        imageUrl: card.imageUrl,
      },
    });

    return res.json({
      success: true,
      card: card,
      rarity: card.rarity,
    });
  } catch (err) {
    console.error("Pack opening failed:", err);
    return res.status(500).json({ error: "Pack opening failed" });
  }
});

/* -------------------------------------------------------
   GET USER BINDER (3×3 pages on frontend)
------------------------------------------------------- */
router.get("/binder", async (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not logged in" });

  try {
    const userId = req.session.user.id;

    // We want:
    // ownedCard → card { name, rarity, imageUrl }
    const cards = await prisma.ownedCard.findMany({
      where: { userId },
      include: {
        card: true, // pulls full card metadata
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json({
      success: true,
      cards, // array of { id, cardId, card: {…} }
    });
  } catch (err) {
    console.error("Binder fetch error:", err);
    res.status(500).json({ error: "Failed to load binder" });
  }
});

/* -------------------------------------------------------
   EXPORT ROUTER
------------------------------------------------------- */
module.exports = router;
