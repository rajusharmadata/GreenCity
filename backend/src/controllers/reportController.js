import { submitReportLogic, myReportsLogic, getReportByIdLogic } from '../services/reportService.js';

const ERROR_CODES = {
  VALIDATION: 'VALIDATION',
  SERVER_ERROR: 'SERVER_ERROR',
};

function sendError(res, status, message, code) {
  return res.status(status).json({ error: message, code });
}

/**
 * POST /api/reports/submit
 * Multipart: image. Body: lat, lng, address?
 */
export async function submitReport(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 401, 'Authentication required.', ERROR_CODES.VALIDATION);
    }
    const lat = req.body?.lat ?? req.body?.['coords[lat]'];
    const lng = req.body?.lng ?? req.body?.['coords[lng]'];
    const address = (req.body?.address ?? '').trim();

    if (!req.file) {
      return sendError(res, 400, 'Image is required.', ERROR_CODES.VALIDATION);
    }
    if (lat === undefined || lat === null || lng === undefined || lng === null) {
      return sendError(
        res,
        400,
        'Exact location (lat/lng) is required so authorities can find and fix the issue. Please enable location and try again.',
        ERROR_CODES.VALIDATION
      );
    }

    const result = await submitReportLogic(userId, {
      filePath: req.file.path,
      lat,
      lng,
      address,
    });
    return res.status(201).json(result);
  } catch (error) {
    // Always log full error on server so we can debug production issues.
    console.error('submitReport error:', error);
    return sendError(res, 500, 'Internal server error', ERROR_CODES.SERVER_ERROR);
  }
}

/**
 * GET /api/reports/my-reports
 */
export async function myReports(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 401, 'Authentication required.', ERROR_CODES.VALIDATION);
    }
    const result = await myReportsLogic(userId);
    return res.json(result);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('myReports error:', error?.message);
    }
    return sendError(res, 500, 'Internal server error', ERROR_CODES.SERVER_ERROR);
  }
}

/**
 * GET /api/reports/:id
 */
export async function getReportById(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return sendError(res, 400, 'Report ID is required.', ERROR_CODES.VALIDATION);
    }
    const result = await getReportByIdLogic(id);
    if (!result.report) {
      return sendError(res, 404, 'Report not found.', ERROR_CODES.VALIDATION);
    }
    return res.json(result);
  } catch (error) {
    console.error('getReportById error:', error);
    return sendError(res, 500, 'Internal server error', ERROR_CODES.SERVER_ERROR);
  }
}

export default { submitReport, myReports, getReportById };
