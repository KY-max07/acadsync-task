import mongoose, { Schema, Document } from 'mongoose';

export interface IPricing extends Document {
  plans: {
    individual: { monthly: number; yearly: number };
    organization: { monthly: number; yearly: number };
    custom: { monthly: number; yearly: number };
  };
  rolePrice: number;
}

const PricingSchema: Schema = new Schema({
  plans: {
    individual: {
      monthly: { type: Number, default: 5000 },
      yearly: { type: Number, default: 50000 },
    },
    organization: {
      monthly: { type: Number, default: 15000 },
      yearly: { type: Number, default: 150000 },
    },
    custom: {
      monthly: { type: Number, default: 15000 },
      yearly: { type: Number, default: 150000 },
    },
  },
  rolePrice: { type: Number, default: 5000 },
}, { timestamps: true });

export default mongoose.model<IPricing>('Pricing', PricingSchema);
