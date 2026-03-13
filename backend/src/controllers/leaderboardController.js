import Leaderboard from "../models/Leaderboard.js";
import User from "../models/User.js";
import PointHistory from "../models/PointHistory.js";

// ─────────────────────────────────────────────────────────────────────────────
// TIER CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const TIERS = [
  { name: "Eco Newcomer", min: 0, max: 99, icon: "🌱", color: "#94a3b8" },
  { name: "Green Scout", min: 100, max: 299, icon: "🍃", color: "#34d399" },
  { name: "City Guardian", min: 300, max: 699, icon: "🌿", color: "#10b981" },
  { name: "Eco Warrior", min: 700, max: 1499, icon: "⚡", color: "#06b6d4" },
  { name: "Urban Hero", min: 1500, max: 2999, icon: "🌍", color: "#6366f1" },
  {
    name: "Planet Saviour",
    min: 3000,
    max: Infinity,
    icon: "🏆",
    color: "#f59e0b"
  }
];

const getTierName = (points = 0) =>
  (TIERS.find((t) => points >= t.min && points <= t.max) ?? TIERS[0]).name;

// ─────────────────────────────────────────────────────────────────────────────
// BADGES (mega-spec style)
// ─────────────────────────────────────────────────────────────────────────────
const BADGES = [
  { name: "Green Starter", points: 50 },
  { name: "Eco Warrior", points: 200 },
  { name: "City Guardian", points: 500 },
  { name: "Planet Hero", points: 1000 }
];

const computeBadges = (points = 0) =>
  BADGES.filter((b) => points >= b.points).map((b) => b.name);

// ─────────────────────────────────────────────────────────────────────────────
// ✅ addPoints — PURE UTILITY, called from other controllers
// FIX 1: Was calling updateLeaderboard() on every invocation = O(n) DB writes
//         per issue report. Now only updates the single user's doc.
// FIX 2: Now auto-updates tier when points change.
// ─────────────────────────────────────────────────────────────────────────────
export const addPoints = async (userId, points, reason = "Action") => {
  try {
    if (!userId || points === undefined || points === null) return null;

    const user = await User.findById(userId).select(
      "points tier name avatar reportsCount badges"
    );
    if (!user) return null;

    const prevPoints = user.points ?? 0;
    const newPoints = Math.max(0, prevPoints + points); // never go below 0
    const newTier = getTierName(newPoints);
    const targetBadges = computeBadges(newPoints);
    const prevBadges = user.badges ?? [];
    const badgesEarned = targetBadges.filter((b) => !prevBadges.includes(b));

    // 1. Update user points + tier + badges
    await User.findByIdAndUpdate(userId, {
      $set: { points: newPoints, tier: newTier, badges: targetBadges }
    });

    // 1b. Points history
    await PointHistory.create({
      userId,
      delta: points,
      reason,
      totalAfter: newPoints
    }).catch(() => {});

    // 2. Update ONLY this user's leaderboard entry — not all users
    await Leaderboard.findOneAndUpdate(
      { userId },
      {
        $set: {
          username: user.name,
          avatar: user.avatar,
          tier: newTier,
          points: newPoints,
          reportsCount: user.reportsCount ?? 0,
          badges: targetBadges,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    console.log(
      `✅ +${points} pts → user ${userId} (${reason}) | total: ${newPoints} | tier: ${newTier}`
    );
    return { newPoints, newTier, badgesEarned };
  } catch (err) {
    // Never crash the parent request
    console.error("⚠️  addPoints error (non-fatal):", err.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// updateLeaderboard — call from a scheduled cron job ONLY, not on every request
// Recalculates all ranks using a single bulk write
// ─────────────────────────────────────────────────────────────────────────────
export const updateLeaderboard = async () => {
  try {
    const users = await User.find({})
      .sort({ points: -1 })
      .select("_id name avatar tier points reportsCount badges")
      .lean();

    // ✅ Bulk write — 1 DB round trip instead of N individual saves
    const bulkOps = users.map((user, idx) => ({
      updateOne: {
        filter: { userId: user._id },
        update: {
          $set: {
            username: user.name,
            avatar: user.avatar,
            tier: user.tier ?? getTierName(user.points ?? 0),
            points: user.points ?? 0,
            reportsCount: user.reportsCount ?? 0,
            badges: user.badges ?? [],
            rank: idx + 1,
            updatedAt: new Date()
          },
          $setOnInsert: {
            previousRank: null,
            rankChange: 0
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Leaderboard.bulkWrite(bulkOps);
    }

    console.log(`✅ Leaderboard rebuilt — ${users.length} users ranked`);
  } catch (err) {
    console.error("❌ updateLeaderboard error:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leaderboard
// ─────────────────────────────────────────────────────────────────────────────
export const getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.tier) filter.tier = req.query.tier;

    const [leaderboard, total] = await Promise.all([
      Leaderboard.find(filter)
        .sort({ points: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Leaderboard.countDocuments(filter)
    ]);

    return res.json({
      leaderboard,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error("getLeaderboard error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leaderboard/me — current user rank + nearby players
// ─────────────────────────────────────────────────────────────────────────────
export const getUserRank = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userEntry = await Leaderboard.findOne({ userId }).lean();
    if (!userEntry) {
      return res.status(404).json({ message: "User not found in leaderboard" });
    }

    const nearbyRankings = await Leaderboard.find({
      points: {
        $gte: Math.max(0, userEntry.points - 200),
        $lte: userEntry.points + 200
      }
    })
      .sort({ points: -1 })
      .limit(11)
      .lean();

    return res.json({ user: userEntry, nearbyRankings });
  } catch (err) {
    console.error("getUserRank error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leaderboard/stats
// ─────────────────────────────────────────────────────────────────────────────
export const getLeaderboardStats = async (req, res) => {
  try {
    const [totalUsers, pointsAgg, tierDist, topContributors] =
      await Promise.all([
        User.countDocuments(),
        User.aggregate([{ $group: { _id: null, total: { $sum: "$points" } } }]),
        User.aggregate([{ $group: { _id: "$tier", count: { $sum: 1 } } }]),
        Leaderboard.find({})
          .sort({ reportsCount: -1 })
          .limit(5)
          .select("username avatar reportsCount tier points")
          .lean()
      ]);

    return res.json({
      totalUsers,
      totalPoints: pointsAgg[0]?.total ?? 0,
      tierDistribution: tierDist,
      topContributors
    });
  } catch (err) {
    console.error("getLeaderboardStats error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export default {
  addPoints,
  updateLeaderboard,
  getLeaderboard,
  getUserRank,
  getLeaderboardStats
};
