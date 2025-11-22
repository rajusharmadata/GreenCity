import express from 'express';
import { getOrganizationRanks } from '../controllers/organizationrank.js';

const router = express.Router();

// Route to get organization rankings
router.get('/rankings', getOrganizationRanks);

export default router;
