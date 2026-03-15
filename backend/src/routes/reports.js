import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { submitReport, myReports } from '../controllers/reportController.js';

const router = express.Router();

router.post('/submit', authenticate, uploadSingle('image'), submitReport);
router.get('/my-reports', authenticate, myReports);

export default router;

