import User from '../../../models/User.js';
import asyncHandler from '../../../utils/asyncHandler.js';
/**
 * GET /api/rankings?page=1&limit=50
 * Ranks users by a weighted score: 70% points + 30% reportsCount.
 *
 * Score, sort, and paging happen inside MongoDB (aggregation) instead of
 * loading every user into Node memory and sorting in JS — this keeps
 * response time flat as the user collection grows.
 *
 * NOTE: leaderboardController.js already maintains a separate `Leaderboard`
 * collection with precomputed points/tier/rank. If this weighted score is
 * meant to match that system rather than be a distinct metric, it'd be
 * cheaper to query Leaderboard directly instead of recomputing here.
 */
export const getUserRankings = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const skip = (page - 1) * limit;

  const [rankedUsers, total] = await Promise.all([
    User.aggregate([
      {
        $project: {
          name: 1,
          avatar: 1,
          points: { $ifNull: ['$points', 0] },
          reportsCount: { $ifNull: ['$reportsCount', 0] },
          score: {
            $add: [
              { $multiply: [{ $ifNull: ['$points', 0] }, 0.7] },
              { $multiply: [{ $ifNull: ['$reportsCount', 0] }, 0.3] }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]),
    User.countDocuments()
  ]);

  // Rank reflects position in the full sorted set, not just this page.
  const rankedWithPosition = rankedUsers.map((user, idx) => ({
    ...user,
    rank: skip + idx + 1
  }));

  res.status(200).json({
    success: true,
    data: {
      users: rankedWithPosition,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export default { getUserRankings };