import mongoose, { Schema, Document } from 'mongoose';

export interface IPortal extends Document {
  name: 'school' | 'teacher' | 'student';
  basePrice: number;
  features: string[];
  addOns: {
    name: string;
    price: number;
    description?: string;
  }[];
  isActive: boolean;
}

const PortalSchema: Schema = new Schema({
  name: { type: String, enum: ['school', 'teacher', 'student'], required: true, unique: true },
  basePrice: { type: Number, required: true },
  features: [{ type: String }],
  addOns: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String }
  }],
  isActive: { type: Boolean, default: true }
});

export default mongoose.model<IPortal>('Portal', PortalSchema);
