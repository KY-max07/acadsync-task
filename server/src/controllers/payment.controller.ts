import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Subscription from '../models/Subscription';

export const processMockPayment = async (req: Request, res: Response) => {
  try {
    const { amount, subscriptionType, portals, features } = req.body;
    const userId = (req as any).user.id;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate Mock IDs
    const mockPaymentId = `MOCK_PAY_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create Payment Record
    const payment = await Payment.create({
      userId,
      transactionId: mockPaymentId,
      paymentMethod: 'card', // Defaulting to card for mock
      subscriptionType,
      amount,
      status: 'success', 
      currency: 'INR'
    });

    // Create/Update Subscription
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const subscription = await Subscription.create({
      userId,
      subscriptionType,
      portalsIncluded: portals,
      featuresSelected: features,
      basePrice: amount, 
      finalPrice: amount,
      startDate: new Date(),
      endDate,
      status: 'active',
      isActive: true, // Assuming this field exists or can be derived
      paypalSubscriptionId: mockPaymentId // storing mock ID here too for ref
    });

    res.json({
      status: 'success',
      paymentId: mockPaymentId,
      amount,
      provider: 'mock',
      subscriptionId: subscription._id
    });

  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
