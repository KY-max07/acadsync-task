import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  transactionId: string;
  paymentMethod: 'card' | 'upi' | 'netbanking';
  subscriptionType: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String, required: true },
  paymentMethod: { type: String, enum: ['card', 'upi', 'netbanking'], required: true },
  subscriptionType: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' }
}, {
  timestamps: true
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);
