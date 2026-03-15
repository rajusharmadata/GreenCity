import { findRoutes as findRoutesService, completeJourney as completeJourneyService } from '../services/routeService.js';

const ERROR_CODES = {
  VALIDATION: 'VALIDATION',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
};

function requireNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

function sendError(res, status, message, code = ERROR_CODES.VALIDATION) {
  return res.status(status).json({ error: message, code });
}

/**
 * POST /api/routes/find
 * Body: { fromLat, fromLng, toAddress }
 */
export async function findRoutes(req, res) {
  try {
    const { fromLat, fromLng, toAddress } = req.body || {};
    if (!requireNumber(fromLat) || !requireNumber(fromLng)) {
      return sendError(res, 400, 'fromLat and fromLng are required and must be numbers.', ERROR_CODES.VALIDATION);
    }
    const address = typeof toAddress === 'string' ? toAddress.trim() : '';
    if (!address) {
      return sendError(res, 400, 'toAddress is required.', ERROR_CODES.VALIDATION);
    }

    const result = await findRoutesService(fromLat, fromLng, address);
    return res.json({
      options: result.options,
      destinationCoords: result.destinationCoords,
      destinationLabel: result.destinationLabel,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[routeController] findRoutes:', err?.message);
    }
    const message = err?.message ?? 'Failed to find routes.';
    return sendError(res, 500, message, ERROR_CODES.SERVER_ERROR);
  }
}

/**
 * POST /api/routes/complete
 * Body: { mode, fromLat, fromLng, toLat, toLng, distanceKm, durationMin }
 */
export async function completeRoute(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 401, 'Authentication required.', ERROR_CODES.VALIDATION);
    }
    const { mode, fromLat, fromLng, toLat, toLng, distanceKm, durationMin } = req.body || {};
    const validModes = ['walk', 'cycle', 'transit', 'drive'];
    if (!validModes.includes(mode)) {
      return sendError(res, 400, 'Invalid mode. Must be one of: walk, cycle, transit, drive.', ERROR_CODES.VALIDATION);
    }
    if (
      !requireNumber(fromLat) ||
      !requireNumber(fromLng) ||
      !requireNumber(toLat) ||
      !requireNumber(toLng) ||
      !requireNumber(distanceKm) ||
      !requireNumber(durationMin)
    ) {
      return sendError(
        res,
        400,
        'fromLat, fromLng, toLat, toLng, distanceKm, and durationMin are required and must be numbers.',
        ERROR_CODES.VALIDATION
      );
    }

    const result = await completeJourneyService(userId, {
      mode,
      fromLat,
      fromLng,
      toLat,
      toLng,
      distanceKm,
      durationMin,
    });
    return res.json({
      message: 'Route completed',
      pointsEarned: result.pointsEarned,
      totalPoints: result.totalPoints,
      history: result.history,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[routeController] completeRoute:', err?.message);
    }
    return sendError(res, 500, 'Failed to complete route.', ERROR_CODES.SERVER_ERROR);
  }
}

export default { findRoutes, completeRoute };
