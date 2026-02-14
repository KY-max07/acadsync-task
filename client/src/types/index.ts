export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  token?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  token: string;
}

export interface Portal {
  _id: string;
  name: 'school' | 'teacher' | 'student';
  basePrice: number;
  features: string[];
  addOns: {
    name: string;
    price: number;
    description?: string;
  }[];
}

export interface Subscription {
  _id: string;
  userId: string;
  subscriptionType: 'individual' | 'organization' | 'custom';
  billingCycle: 'monthly' | 'yearly';
  portalsIncluded: string[];
  featuresSelected: string[];
  basePrice: number;
  discountApplied: number;
  finalPrice: number;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface PricingBreakdown {
  portals: { name: string; price: number }[];
  features: { name: string; price: number }[];
  bundleDiscount?: string;
}

export interface PricingResponse {
  basePrice: number;
  discount: number;
  finalPrice: number;
  breakdown: PricingBreakdown;
}
