import Transport from '../models/Transport.js';

// Create transport route
export const createTransport = async (req, res) => {
  try {
    const { route, from, to, type, frequency, carbonSaved, distance, duration, coords } = req.body;

    // Validation
    if (!route || !from || !to || !type || !frequency || !carbonSaved || !distance || !duration || !coords) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!coords.lat || !coords.lng) {
      return res.status(400).json({ error: 'Coordinates are required' });
    }

    // Validate transport type
    const validTypes = ['Electric Bus', 'Bike Share', 'Solar Tram', 'EV Shuttle', 'Solar Ferry'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid transport type' });
    }

    const transport = new Transport({
      route: route.trim(),
      from: from.trim(),
      to: to.trim(),
      type,
      frequency: frequency.trim(),
      carbonSaved: parseFloat(carbonSaved),
      distance: parseFloat(distance),
      duration: parseInt(duration),
      coords: {
        lat: parseFloat(coords.lat),
        lng: parseFloat(coords.lng)
      }
    });

    await transport.save();

    res.status(201).json({
      message: 'Transport route created successfully',
      transport
    });
  } catch (error) {
    console.error('Create transport error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all transport routes with filtering
export const getTransports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      isActive = true,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: isActive === 'true' };
    
    if (type) filter.type = type;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const transports = await Transport.find(filter)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Transport.countDocuments(filter);

    res.json({
      transports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get transports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get nearby transport routes
export const getNearbyTransports = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query; // radius in kilometers

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Convert radius to degrees (approximate)
    const radiusInDegrees = radius / 111; // 1 degree ≈ 111 km

    const transports = await Transport.find({
      isActive: true,
      coords: {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusInDegrees]
        }
      }
    }).sort({ createdAt: -1 });

    res.json({ transports });
  } catch (error) {
    console.error('Get nearby transports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single transport route
export const getTransport = async (req, res) => {
  try {
    const { id } = req.params;

    const transport = await Transport.findById(id);
    if (!transport) {
      return res.status(404).json({ error: 'Transport route not found' });
    }

    res.json({ transport });
  } catch (error) {
    console.error('Get transport error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update transport route
export const updateTransport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate transport type if provided
    if (updateData.type) {
      const validTypes = ['Electric Bus', 'Bike Share', 'Solar Tram', 'EV Shuttle', 'Solar Ferry'];
      if (!validTypes.includes(updateData.type)) {
        return res.status(400).json({ error: 'Invalid transport type' });
      }
    }

    const transport = await Transport.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!transport) {
      return res.status(404).json({ error: 'Transport route not found' });
    }

    res.json({
      message: 'Transport route updated successfully',
      transport
    });
  } catch (error) {
    console.error('Update transport error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete transport route
export const deleteTransport = async (req, res) => {
  try {
    const { id } = req.params;

    const transport = await Transport.findByIdAndDelete(id);
    if (!transport) {
      return res.status(404).json({ error: 'Transport route not found' });
    }

    res.json({ message: 'Transport route deleted successfully' });
  } catch (error) {
    console.error('Delete transport error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get transport stats
export const getTransportStats = async (req, res) => {
  try {
    const totalRoutes = await Transport.countDocuments({ isActive: true });
    
    const typeDistribution = await Transport.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 }, totalCarbonSaved: { $sum: '$carbonSaved' } } }
    ]);

    const totalCarbonSaved = await Transport.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$carbonSaved' } } }
    ]);

    const totalDistance = await Transport.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$distance' } } }
    ]);

    res.json({
      totalRoutes,
      typeDistribution,
      totalCarbonSaved: totalCarbonSaved[0]?.total || 0,
      totalDistance: totalDistance[0]?.total || 0
    });
  } catch (error) {
    console.error('Get transport stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  createTransport,
  getTransports,
  getNearbyTransports,
  getTransport,
  updateTransport,
  deleteTransport,
  getTransportStats
};