import { Request, Response } from 'express';
import { calculatePricing } from '../services/pricing.service';

export const getPricing = async (req: Request, res: Response) => {
  try {
    const calculation = await calculatePricing(req.body);
    res.json(calculation);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
