import TransportEntry from '../models/TransportEntry.js';

export const createTransportEntry = async (req, res) => {
  try {
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
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    if (!Array.isArray(departureTimes) || departureTimes.length === 0) {
      return res.status(400).json({ message: 'departureTimes must be a non-empty array.' });
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
    res.status(201).json({ message: 'Transport option created successfully.', data: saved });
  } catch (error) {
    console.error('Error creating transport entry:', error);
    res.status(500).json({ message: 'Server error.', error });
  }
};

export const getAllAgencyTransports = async (req, res) => {
  try {
    const entries = await TransportEntry.find();
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching agency transports:', error);
    res.status(500).json({ message: 'Server error.', error });
  }
};

// Get transport entries by organization/agency name
export const getTransportsByOrganization = async (req, res) => {
  try {
    const { agencyName } = req.params;
    
    if (!agencyName) {
      return res.status(400).json({ message: 'Agency name is required.' });
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
      entries,
      stats
    });
  } catch (error) {
    console.error('Error fetching organization transports:', error);
    res.status(500).json({ message: 'Server error.', error });
  }
};
