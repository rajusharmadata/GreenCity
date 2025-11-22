import express from 'express';
import { checkTransportAvailability } from '../controllers/TransportQuery.js';

const router = express.Router();

router.post('/transport', checkTransportAvailability);

export default router;

