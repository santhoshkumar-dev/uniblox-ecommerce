import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  items: {
    productId: mongoose.Types.ObjectId;
    productName: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  finalAmount: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";
  createdAt: Date;
}

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true }, // Captured at purchase time
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discountCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "SHIPPED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
