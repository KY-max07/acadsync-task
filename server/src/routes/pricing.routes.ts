import express from 'express';
import { getPricing } from '../controllers/pricing.controller';

const router = express.Router();

router.post('/calculate', getPricing);

export default router;
