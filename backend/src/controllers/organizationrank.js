import Organization from '../models/organization.js';

export const getOrganizationRanks = async (req, res) => {
  try {
    // Fetch all organizations sorted by issuesolved (descending)
    const organizations = await Organization.find().sort({ issuesolved: -1 });

    // Assign rank based on position in sorted list
    const rankedOrganizations = organizations.map((org, index) => ({
      rank: index + 1,
      organizationName: org.organizationName,
      organizationId: org.organizationId,
      issuesolved: org.issuesolved,
      email: org.email,
      phone: org.phone
    }));

    res.status(200).json(rankedOrganizations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch organization rankings', error: error.message });
  }
};
