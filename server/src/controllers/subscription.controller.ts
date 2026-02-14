import { Request, Response } from 'express';
import Subscription from '../models/Subscription';
import Payment from '../models/Payment';

export const getMySubscription = async (req: Request, res: Response) => {
  try {
    // req.user is populated by auth middleware
    const userId = (req as any).user.id;

    const subscription = await Subscription.findOne({ 
        userId, 
        status: 'active' 
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const upgradeSubscription = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { planId, billingCycle, portalsIncluded, paymentMethod, amount } = req.body;

        if (!planId || !amount || !paymentMethod) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1. Create Payment Record (Mock transaction)
        const mockPaymentId = `PAY_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
         await Payment.create({
            userId,
            transactionId: mockPaymentId,
            paymentMethod,
            subscriptionType: planId,
            amount,
            status: 'success',
            currency: 'INR'
        });

        // 2. Deactivate current active subscription
        await Subscription.updateMany(
            { userId, status: 'active' },
            { $set: { status: 'upgraded', isActive: false, endDate: new Date() } }
        );

        // 3. Create New Subscription
        const startDate = new Date();
        const endDate = new Date();
        
        const finalBillingCycle = billingCycle || 'monthly';
        if (finalBillingCycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // Determine portals based on plan if not explicitly provided
        let finalPortals = portalsIncluded || [];
        if (finalPortals.length === 0) {
            if (planId === 'organization') {
                finalPortals = ['student', 'teacher', 'school'];
            } else if (planId === 'individual') {
                finalPortals = ['student']; // Default fallback
            }
        }

        const newSubscription = await Subscription.create({
            userId,
            subscriptionType: planId,
            billingCycle: finalBillingCycle,
            portalsIncluded: finalPortals,
            featuresSelected: [],
            basePrice: amount,
            finalPrice: amount,
            startDate,
            endDate,
            status: 'active',
            isActive: true
        });

        res.status(200).json(newSubscription);

    } catch (error) {
        console.error('Upgrade failed:', error);
        res.status(500).json({ message: 'Server error during upgrade' });
    }
};
