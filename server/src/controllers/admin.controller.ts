import { Request, Response } from 'express';
import User from '../models/User';
import Subscription from '../models/Subscription';
import Pricing from '../models/Pricing';

// Get all users with their latest subscription
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).lean(); // Exclude admins
    
    // Fetch active subscriptions for these users
    const usersWithSubs = await Promise.all(users.map(async (user) => {
        const sub = await Subscription.findOne({ userId: user._id, status: 'active' }).sort({ createdAt: -1 });
        return {
            ...user,
            subscription: sub ? {
                plan: sub.subscriptionType,
                status: sub.status,
                endDate: sub.endDate,
                finalPrice: sub.finalPrice
            } : null
        };
    }));

    res.json(usersWithSubs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// Get current pricing configuration
export const getPricingConfig = async (req: Request, res: Response) => {
    try {
        let pricing = await Pricing.findOne();
        if (!pricing) {
            // Create default if not exists
            pricing = await Pricing.create({});
        }
        res.json(pricing);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching pricing' });
    }
};

// Update pricing configuration
export const updatePricingConfig = async (req: Request, res: Response) => {
    try {
        const { plans, rolePrice } = req.body;
        const pricing = await Pricing.findOneAndUpdate({}, { plans, rolePrice }, { new: true, upsert: true });
        res.json(pricing);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating pricing' });
    }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        
        // 1. Delete User
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Delete related data (Subscription)
        // In a real app, you might soft-delete or keep data for records. 
        // For this task, we'll hard delete to clean up.
        await Subscription.findOneAndDelete({ userId });
        
        // Also delete payments? Optional, maybe keep for revenue stats.
        // For now, let's keep payments as "orphan" records or delete if strict.
        // await Payment.deleteMany({ userId });

        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting user' });
    }
};
