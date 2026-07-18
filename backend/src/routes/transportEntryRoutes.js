import express from 'express';
const router = express.Router();
import {
  createTransportEntry,
  getAllAgencyTransports,
  getTransportsByOrganization,
} from '../controllers/transportEntryController.js';

router.post('/submit', createTransportEntry);
router.get('/all', getAllAgencyTransports);
router.get('/organization/:agencyName', getTransportsByOrganization);
router.get('/', getAllAgencyTransports);

export default router;
