// routes/ranking.js
import express from 'express';
import { getUserRankings } from '../controllers/userrank.js';

const router = express.Router();

router.get('/rankings', getUserRankings);

export default router;
