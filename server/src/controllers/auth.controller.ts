import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { z } from 'zod';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// Register Schema
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  organizationType: z.enum(['School', 'College', 'University', 'Other'])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ message: (validation.error as any).errors[0].message });
    }

    const { name, email, password, phoneNumber, organizationType } = validation.data;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      organizationType,
      role: 'user', // Default role to 'user' as it's no longer in schema
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role), // Keep original generateToken signature
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

import Payment from '../models/Payment';
import Subscription from '../models/Subscription';

// Extended Register Schema
const registerWithSubscriptionSchema = registerSchema.extend({
  subscriptionPlan: z.string(),
  paymentMethod: z.enum(['card', 'upi', 'netbanking']),
  amount: z.number(),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
  portalsIncluded: z.array(z.enum(['student', 'teacher', 'school'])).optional(),
});

export const registerWithSubscription = async (req: Request, res: Response) => {
  try {
    const validation = registerWithSubscriptionSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ message: validation.error.issues[0].message });
    }

    const { name, email, password, phoneNumber, organizationType, subscriptionPlan, paymentMethod, amount, portalsIncluded, billingCycle } = validation.data;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- MOCK PAYMENT & TRANSACTION ---
    // In a real app, use a transaction here: const session = await mongoose.startSession(); session.startTransaction();

    // 1. Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      organizationType,
      role: 'user',
    });

    if (user) {
      // 2. Create Payment Record
      const mockPaymentId = `PAY_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      await Payment.create({
        userId: user._id,
        transactionId: mockPaymentId,
        paymentMethod,
        subscriptionType: subscriptionPlan,
        amount,
        status: 'success',
        currency: 'INR'
      });

      // 3. Create Subscription
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
          if (subscriptionPlan === 'organization') {
              finalPortals = ['student', 'teacher', 'school'];
          } else if (subscriptionPlan === 'individual') {
              // Default to 'teacher' or 'student' if nothing selected? Or maybe just 'student'.
              // But frontend should send it. We'll default to ['student'] to be safe if missing.
              finalPortals = ['student'];
          }
      }

      await Subscription.create({
        userId: user._id,
        subscriptionType: subscriptionPlan,
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

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password as string))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues });
    } else {
      res.status(500).json({ message: (error as Error).message });
    }
  }
};
