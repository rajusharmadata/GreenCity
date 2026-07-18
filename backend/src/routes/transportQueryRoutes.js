import express from 'express';
import { checkTransportAvailability } from '../controllers/transportQueryController.js';

const router = express.Router();

router.post('/transport', checkTransportAvailability);

export default router;

