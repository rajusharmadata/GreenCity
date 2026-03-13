import PointHistory from '../models/PointHistory.js';
import User from '../models/User.js';

export const getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const history = await PointHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return res.json({ history });
  } catch (error) {
    console.error('getHistory error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBadges = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('badges points tier').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ badges: user.badges ?? [], points: user.points ?? 0, tier: user.tier });
  } catch (error) {
    console.error('getBadges error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default { getHistory, getBadges };

