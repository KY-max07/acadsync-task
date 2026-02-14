import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  subscriptionType: 'individual' | 'organization' | 'custom';
  billingCycle: 'monthly' | 'yearly';
  portalsIncluded: ('school' | 'teacher' | 'student')[];
  featuresSelected: string[]; // List of specific features or add-ons active
  basePrice: number;
  discountApplied: number;
  finalPrice: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  isActive: boolean;
}

const SubscriptionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionType: { 
    type: String, 
    enum: ['individual', 'organization', 'custom'], 
    required: true 
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  portalsIncluded: [{ 
    type: String, 
    enum: ['school', 'teacher', 'student'] 
  }],
  featuresSelected: [{ type: String }],
  basePrice: { type: Number, required: true },
  discountApplied: { type: Number, default: 0 },
  finalPrice: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'pending', 'cancelled'], 
    default: 'pending' 
  },
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
