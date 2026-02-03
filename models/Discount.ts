import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiscount extends Document {
  code: string;
  percentage: number;

  // New fields
  isPublic: boolean;
  maxUses: number; // Total number of times this code can be used
  usedCount: number; // Current number of times used

  // Tracking
  usageHistory: { userId: string; orderId: string; usedAt: Date }[];

  // Deprecated/Legacy support (optional, but good to keep for type safety if needed temporarily)
  isUsed?: boolean;
  usedBy?: string;
  orderId?: string;

  expiresAt?: Date;
  createdAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
  {
    code: { type: String, required: true, unique: true },
    percentage: { type: Number, required: true, min: 1, max: 100 },

    isPublic: { type: Boolean, default: false },
    maxUses: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },

    usageHistory: [
      {
        userId: { type: String },
        orderId: { type: String },
        usedAt: { type: Date, default: Date.now },
      },
    ],

    // Legacy fields (can be kept or removed; keeping for safety)
    isUsed: { type: Boolean, default: false },
    usedBy: { type: String },
    orderId: { type: String },

    expiresAt: { type: Date },
  },
  { timestamps: true },
);

export const Discount: Model<IDiscount> =
  mongoose.models.Discount ||
  mongoose.model<IDiscount>("Discount", DiscountSchema);
