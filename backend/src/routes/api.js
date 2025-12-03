const express = require("express");
const router = express.Router();
const prisma = require("../prisma"); // ← Make sure this points to your prisma client

// Middleware: ensure the user is authenticated
// You said you're using Twitch OAuth session → so req.session.user should exist
function requireUser(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

// -------------------------------------------------------------
// GET /api/user/stats
// -------------------------------------------------------------
router.get("/user/stats", requireUser, async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Count total cards
    const totalCards = await prisma.ownedCard.count({
      where: { userId },
    });

    // Count unique cards
    const uniqueCards = await prisma.ownedCard.findMany({
      where: { userId },
      select: { cardId: true },
    });
    const uniqueCount = new Set(uniqueCards.map(c => c.cardId)).size;

    // Count rarity breakdown
    const rarityCounts = await prisma.ownedCard.groupBy({
      by: ["cardId"],
      _count: true,
    });

    const cardInfo = await prisma.card.findMany({
      where: {
        id: { in: rarityCounts.map(r => r.cardId) }
      },
      select: { id: true, rarity: true }
    });

    const rarityBreakdown = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };

    cardInfo.forEach(card => {
      const rarity = card.rarity.toLowerCase();
      if (rarityBreakdown[rarity] !== undefined) {
        rarityBreakdown[rarity]++;
      }
    });

    // Return stats
    res.json({
      totalCards,
      uniqueCards: uniqueCount,
      rarityBreakdown,
    });

  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// -------------------------------------------------------------
// GET /api/user/recent
// -------------------------------------------------------------
router.get("/user/recent", requireUser, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const pulls = await prisma.ownedCard.findMany({
      where: { userId },
      orderBy: { acquiredAt: "desc" },
      take: 10,
      include: {
        card: true,
      },
    });

    const formatted = pulls.map(p => ({
      id: p.id,
      name: p.card.name,
      rarity: p.card.rarity,
      imageUrl: p.card.imageUrl,
      acquiredAt: p.acquiredAt,
    }));

    res.json(formatted);

  } catch (err) {
    console.error("Recent error:", err);
    res.status(500).json({ error: "Failed to load recent cards" });
  }
});

module.exports = router;
