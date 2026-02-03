import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiscount extends Document {
  code: string;
  percentage: number;
  isUsed: boolean;
  usedBy?: string; // UserId
  orderId?: string; // Order where it was used
  expiresAt?: Date;
  createdAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    code: { type: String, required: true, unique: true },
    percentage: { type: Number, required: true, min: 1, max: 100 },
    isUsed: { type: Boolean, default: false },
    usedBy: { type: String },
    orderId: { type: String }, // Reference to Order ID
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

export const Discount: Model<IDiscount> =
  mongoose.models.Discount ||
  mongoose.model<IDiscount>("Discount", DiscountSchema);
