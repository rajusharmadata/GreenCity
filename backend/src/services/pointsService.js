import { addPoints as addPointsImpl } from '../controllers/leaderboardController.js';

export async function addPoints(userId, points, reason = 'Action') {
  try {
    return await addPointsImpl(userId, points, reason);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[pointsService] addPoints error:', err?.message);
    }
    return null;
  }
}

export default { addPoints };
