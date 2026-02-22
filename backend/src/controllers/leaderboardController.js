import Leaderboard from '../models/Leaderboard.js';
import User from '../models/User.js';

// Update leaderboard rankings
export const updateLeaderboard = async () => {
  try {
    // Get all users sorted by points
    const users = await User.find({})
      .sort({ points: -1 })
      .select('_id name avatar tier points reportsCount badges');

    // Update rankings
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const currentRank = i + 1;

      // Find existing leaderboard entry
      const existingEntry = await Leaderboard.findOne({ userId: user._id });

      if (existingEntry) {
        // Update existing entry
        const previousRank = existingEntry.rank;
        existingEntry.username = user.name;
        existingEntry.avatar = user.avatar;
        existingEntry.tier = user.tier;
        existingEntry.points = user.points;
        existingEntry.reportsCount = user.reportsCount;
        existingEntry.badges = user.badges;
        existingEntry.previousRank = previousRank;
        existingEntry.rankChange = previousRank - currentRank;
        existingEntry.rank = currentRank;
        existingEntry.updatedAt = new Date();
        await existingEntry.save();
      } else {
        // Create new entry
        await Leaderboard.create({
          userId: user._id,
          username: user.name,
          avatar: user.avatar,
          tier: user.tier,
          points: user.points,
          reportsCount: user.reportsCount,
          badges: user.badges,
          rank: currentRank,
          previousRank: null,
          rankChange: 0
        });
      }
    }

    console.log('✅ Leaderboard updated successfully');
  } catch (error) {
    console.error('❌ Leaderboard update error:', error);
  }
};

// Get leaderboard with pagination
export const getLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 20, tier } = req.query;

    const filter = {};
    if (tier) filter.tier = tier;

    const leaderboard = await Leaderboard.find(filter)
      .sort({ rank: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Leaderboard.countDocuments(filter);

    res.json({
      leaderboard,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user rank
export const getUserRank = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userEntry = await Leaderboard.findOne({ userId });
    if (!userEntry) {
      return res.status(404).json({ error: 'User not found in leaderboard' });
    }

    // Get nearby rankings (5 above and 5 below)
    const nearbyRankings = await Leaderboard.find({
      rank: {
        $gte: Math.max(1, userEntry.rank - 5),
        $lte: userEntry.rank + 5
      }
    }).sort({ rank: 1 });

    res.json({
      user: userEntry,
      nearbyRankings
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get leaderboard stats
export const getLeaderboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPoints = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    const tierDistribution = await User.aggregate([
      { $group: { _id: '$tier', count: { $sum: 1 } } }
    ]);

    const topContributors = await Leaderboard.find({})
      .sort({ reportsCount: -1 })
      .limit(5)
      .select('username avatar reportsCount');

    res.json({
      totalUsers,
      totalPoints: totalPoints[0]?.total || 0,
      tierDistribution,
      topContributors
    });
  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add points to user (for issue reporting, upvotes, etc.)
export const addPoints = async (userId, points, reason = 'Unknown') => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { points: points } },
      { new: true }
    );

    if (user) {
      console.log(`Added ${points} points to user ${userId} for ${reason}`);
      
      // Update leaderboard
      await updateLeaderboard();
      
      return user.points;
    }
  } catch (error) {
    console.error('Add points error:', error);
  }
};

export default {
  updateLeaderboard,
  getLeaderboard,
  getUserRank,
  getLeaderboardStats,
  addPoints
};