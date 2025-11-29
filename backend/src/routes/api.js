const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { broadcast } = require("../realtime/wsServer");

const prisma = new PrismaClient();

/* -------------------------------------------------------
   RARITY WEIGHTS
------------------------------------------------------- */
const RARITY_WEIGHTS = {
  common: 70,
  uncommon: 20,
  rare: 8,
  epic: 2,
};

// Choose rarity using weighted probabilities
function getRandomRarity() {
  const total =
    RARITY_WEIGHTS.common +
    RARITY_WEIGHTS.uncommon +
    RARITY_WEIGHTS.rare +
    RARITY_WEIGHTS.epic;

  let roll = Math.random() * total;

  for (const rarity in RARITY_WEIGHTS) {
    roll -= RARITY_WEIGHTS[rarity];
    if (roll <= 0) return rarity;
  }

  return "common"; // fallback
}

/* -------------------------------------------------------
   OPEN PACK ENDPOINT
------------------------------------------------------- */
router.post("/packs/open", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const userId = req.session.user.id;

  try {
    const rarity = getRandomRarity();

    const cards = await prisma.card.findMany({
      where: { rarity },
    });

    if (cards.length === 0) {
      return res.status(500).json({
        error: `No cards available for rarity: ${rarity}`,
      });
    }

    const card =
      cards[Math.floor(Math.random() * cards.length)];

    const owned = await prisma.ownedCard.create({
      data: {
        userId,
        cardId: card.id,
      },
    });

    // 🔥 Broadcast the pack opening to OBS
    broadcast({
      type: "PACK_OPENED",
      user: req.session.user.displayName,
      rarity,
      card: {
        id: card.id,
        name: card.name,
        rarity: card.rarity,
        imageUrl: card.imageUrl,
      },
    });

    return res.json({
      success: true,
      rarity,
      card,
    });
  } catch (err) {
    console.error("Pack open error:", err);
    return res.status(500).json({ error: "Failed to open pack" });
  }
});

/* -------------------------------------------------------
   GET USER'S BINDER (ALL CARDS THEY OWN)
------------------------------------------------------- */
router.get("/binder", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const cards = await prisma.ownedCard.findMany({
      where: { userId: req.session.user.id },
      include: {
        card: true, // Includes card details
      },
    });

    return res.json({ cards });
  } catch (err) {
    console.error("Binder error:", err);
    return res.status(500).json({ error: "Failed to fetch binder" });
  }
});

module.exports = router;
