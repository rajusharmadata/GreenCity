// controllers/rankController.js
import User from '../models/auth.js';

export const getUserRankings = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    // Calculate score for each user
    const rankedUsers = users
      .map(user => ({
        _id: user._id,
        username: user.username,
        points: user.points,
        issuecount: user.issuecount,
        score: (user.points * 0.7) + (user.issuecount * 0.3)
      }))
      .sort((a, b) => b.score - a.score); // Sort descending by score

    // Assign ranks
    rankedUsers.forEach((user, index) => {
      user.rank = index + 1;
    });

    res.status(200).json(rankedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching rankings', error: error.message });
  }
};
