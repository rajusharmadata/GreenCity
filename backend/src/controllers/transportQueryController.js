import TransportQuery from '../models/TransportQuery.js';
import TransportEntry from '../models/TransportEntry.js';

// Check transport availability and optionally log the user query
export const checkTransportAvailability = async (req, res) => {
  try {
    const { from, to, transportType } = req.body;

    if (!from || !to) {
      return res.status(400).json({ message: 'Both "from" and "to" fields are required.' });
    }

    // Save the user query (optional)
    const newQuery = new TransportQuery({ from, to });
    await newQuery.save();

    // Build search query with case-insensitive partial matching
    const searchQuery = {
      $or: [
        { from: { $regex: from.trim(), $options: 'i' } },
        { to: { $regex: to.trim(), $options: 'i' } }
      ]
    };

    // If both from and to are provided, try to find routes that match either
    // First try exact matches (case-insensitive)
    let results = await TransportEntry.find({
      from: { $regex: `^${from.trim()}$`, $options: 'i' },
      to: { $regex: `^${to.trim()}$`, $options: 'i' }
    });

    // If no exact matches, try partial matches
    if (results.length === 0) {
      results = await TransportEntry.find({
        $or: [
          {
            from: { $regex: from.trim(), $options: 'i' },
            to: { $regex: to.trim(), $options: 'i' }
          },
          {
            from: { $regex: to.trim(), $options: 'i' },
            to: { $regex: from.trim(), $options: 'i' }
          }
        ]
      });
    }

    // Filter by transport type if provided
    if (transportType && transportType.trim() !== '') {
      results = results.filter(entry => 
        entry.transportType.toLowerCase() === transportType.toLowerCase()
      );
    }

    // If still no results, try searching for routes that contain the search terms
    if (results.length === 0) {
      results = await TransportEntry.find({
        $or: [
          { from: { $regex: from.trim(), $options: 'i' } },
          { to: { $regex: to.trim(), $options: 'i' } },
          { from: { $regex: to.trim(), $options: 'i' } },
          { to: { $regex: from.trim(), $options: 'i' } }
        ]
      });

      // Filter by transport type if provided
      if (transportType && transportType.trim() !== '') {
        results = results.filter(entry => 
          entry.transportType.toLowerCase() === transportType.toLowerCase()
        );
      }
    }

    // Return results even if empty (let frontend handle the message)
    res.status(200).json({ 
      message: results.length > 0 ? 'Transport options found.' : 'No exact matches found. Showing related routes.',
      data: results,
      searchTerms: { from, to }
    });
  } catch (error) {
    console.error('Error checking transport availability:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
