import Transport from '../../../models/Transport.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../middleware/errorMiddleware.js';

const VALID_TYPES = ['Electric Bus', 'Bike Share', 'Solar Tram', 'EV Shuttle', 'Solar Ferry'];
const EARTH_KM_PER_DEGREE = 111;

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transports
// ─────────────────────────────────────────────────────────────────────────────
export const createTransport = asyncHandler(async (req, res) => {
  const { route, from, to, type, frequency, carbonSaved, distance, duration, coords } = req.body;

  if (!route || !from || !to || !type || !frequency || !carbonSaved || !distance || !duration || !coords) {
    throw new ApiError(400, 'All fields are required');
  }
  if (!coords.lat || !coords.lng) {
    throw new ApiError(400, 'Coordinates are required');
  }
  if (!VALID_TYPES.includes(type)) {
    throw new ApiError(400, 'Invalid transport type');
  }

  const transport = await Transport.create({
    route: route.trim(),
    from: from.trim(),
    to: to.trim(),
    type,
    frequency: frequency.trim(),
    carbonSaved: parseFloat(carbonSaved),
    distance: parseFloat(distance),
    duration: parseInt(duration, 10),
    coords: { lat: parseFloat(coords.lat), lng: parseFloat(coords.lng) }
  });

  res.status(201).json({
    success: true,
    message: 'Transport route created successfully',
    data: { transport }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transports
// ─────────────────────────────────────────────────────────────────────────────
export const getTransports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, isActive = true, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Number(limit) || 20, 100);

  const filter = { isActive: isActive === 'true' || isActive === true };
  if (type) filter.type = type;

  const [transports, total] = await Promise.all([
    Transport.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean(),
    Transport.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      transports,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transports/nearby
// ─────────────────────────────────────────────────────────────────────────────
export const getNearbyTransports = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5 } = req.query;

  if (!lat || !lng) throw new ApiError(400, 'Latitude and longitude are required');

  const radiusInDegrees = Number(radius) / EARTH_KM_PER_DEGREE;

  const transports = await Transport.find({
    isActive: true,
    coords: {
      $geoWithin: { $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInDegrees] }
    }
  })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: { transports } });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transports/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getTransport = asyncHandler(async (req, res) => {
  const transport = await Transport.findById(req.params.id).lean();
  if (!transport) throw new ApiError(404, 'Transport route not found');

  res.json({ success: true, data: { transport } });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/transports/:id
// ─────────────────────────────────────────────────────────────────────────────
export const updateTransport = asyncHandler(async (req, res) => {
  const updateData = req.body;

  if (updateData.type && !VALID_TYPES.includes(updateData.type)) {
    throw new ApiError(400, 'Invalid transport type');
  }

  const transport = await Transport.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  if (!transport) throw new ApiError(404, 'Transport route not found');

  res.json({
    success: true,
    message: 'Transport route updated successfully',
    data: { transport }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/transports/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteTransport = asyncHandler(async (req, res) => {
  const transport = await Transport.findByIdAndDelete(req.params.id);
  if (!transport) throw new ApiError(404, 'Transport route not found');

  res.json({ success: true, message: 'Transport route deleted successfully' });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transports/stats
// Single aggregation round trip via $facet instead of 3 separate queries.
// ─────────────────────────────────────────────────────────────────────────────
export const getTransportStats = asyncHandler(async (req, res) => {
  const [result] = await Transport.aggregate([
    { $match: { isActive: true } },
    {
      $facet: {
        totalRoutes: [{ $count: 'count' }],
        typeDistribution: [
          { $group: { _id: '$type', count: { $sum: 1 }, totalCarbonSaved: { $sum: '$carbonSaved' } } }
        ],
        totals: [
          {
            $group: {
              _id: null,
              totalCarbonSaved: { $sum: '$carbonSaved' },
              totalDistance: { $sum: '$distance' }
            }
          }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      totalRoutes: result.totalRoutes[0]?.count ?? 0,
      typeDistribution: result.typeDistribution,
      totalCarbonSaved: result.totals[0]?.totalCarbonSaved ?? 0,
      totalDistance: result.totals[0]?.totalDistance ?? 0
    }
  });
});

export default {
  createTransport,
  getTransports,
  getNearbyTransports,
  getTransport,
  updateTransport,
  deleteTransport,
  getTransportStats
};