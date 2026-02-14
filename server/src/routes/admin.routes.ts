import express from 'express';
import { protect, admin } from '../middleware/auth.middleware';
import { getAllUsers, getPricingConfig, updatePricingConfig, deleteUser } from '../controllers/admin.controller';

const router = express.Router();

// User Management
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);

// Pricing Management (Public read, Admin write)
router.get('/pricing', getPricingConfig); // Public for frontend to calculate prices
router.put('/pricing', protect, admin, updatePricingConfig);

export default router;
