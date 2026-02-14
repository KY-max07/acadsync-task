import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getMySubscription, upgradeSubscription } from '../controllers/subscription.controller';

const router = express.Router();

router.get('/me', protect, getMySubscription);
router.post('/upgrade', protect, upgradeSubscription);

export default router;
