import TransportEntry from '../../../models/TransportEntry.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import { ApiError } from '../../../middleware/errorMiddleware.js';

export const createTransportEntry = asyncHandler(async (req, res) => {
  const {
    agencyName,
    transportType,
    from,
    to,
    departureTimes,
    frequency,
    fare,
    contactInfo,
  } = req.body;

  if (!agencyName || !transportType || !from || !to || !departureTimes || !fare) {
    throw new ApiError(400, 'Please provide all required fields.');
  }

  if (!Array.isArray(departureTimes) || departureTimes.length === 0) {
    throw new ApiError(400, 'departureTimes must be a non-empty array.');
  }

  const newEntry = new TransportEntry({
    agencyName,
    transportType,
    from,
    to,
    departureTimes,
    frequency,
    fare,
    contactInfo,
  });

  const saved = await newEntry.save();
  res.status(201).json({ 
    success: true,
    message: 'Transport option created successfully.', 
    data: saved 
  });
});

export const getAllAgencyTransports = asyncHandler(async (req, res) => {
  const entries = await TransportEntry.find();
  res.status(200).json({ 
    success: true,
    data: entries 
  });
});

// Get transport entries by organization/agency name
export const getTransportsByOrganization = asyncHandler(async (req, res) => {
  const { agencyName } = req.params;
  
  if (!agencyName) {
    throw new ApiError(400, 'Agency name is required.');
  }

  const entries = await TransportEntry.find({ agencyName: agencyName });
  
  // Calculate statistics
  const stats = {
    total: entries.length,
    byType: {},
    routes: [],
    totalRoutes: 0
  };

  entries.forEach(entry => {
    // Count by transport type
    stats.byType[entry.transportType] = (stats.byType[entry.transportType] || 0) + 1;
    
    // Collect unique routes
    const route = `${entry.from} → ${entry.to}`;
    if (!stats.routes.find(r => r.route === route)) {
      stats.routes.push({
        route: route,
        from: entry.from,
        to: entry.to,
        transportType: entry.transportType,
        count: 1
      });
    } else {
      const existingRoute = stats.routes.find(r => r.route === route);
      existingRoute.count++;
    }
  });

  stats.totalRoutes = stats.routes.length;

  res.status(200).json({
    success: true,
    data: {
      entries,
      stats
    }
  });
});
