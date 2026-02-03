import { Discount } from "@/models/Discount";
import { Order } from "@/models/Order";
import connectDB from "@/lib/db";
import crypto from "crypto";

const N_ORDER_THRESHOLD = 5; // Configurable
const DISCOUNT_PERCENTAGE = 10;

export async function validateDiscount(code: string, userId: string) {
  await connectDB();
  const discount = await Discount.findOne({ code, isUsed: false });

  if (!discount) return null;
  if (discount.expiresAt && discount.expiresAt < new Date()) return null;

  // Optional: Check if discount is locked to a user? Prompt says "User-scoped" is for Cart.
  // Prompt says "Discount system... unique... one time use".
  return discount;
}

export async function markDiscountUsed(
  code: string,
  userId: string,
  orderId: string,
) {
  await connectDB();
  return await Discount.findOneAndUpdate(
    { code },
    { isUsed: true, usedBy: userId, orderId },
    { new: true },
  );
}

export async function checkAndGenerateDiscount() {
  await connectDB();
  // Global order count
  const count = await Order.countDocuments({
    status: { $in: ["PAID", "SHIPPED"] },
  });

  if (count > 0 && count % N_ORDER_THRESHOLD === 0) {
    const code = `DEAL-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    await Discount.create({
      code,
      percentage: DISCOUNT_PERCENTAGE,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    return code;
  }
  return null;
}

export async function getDiscounts() {
  await connectDB();
  return await Discount.find({}).sort({ createdAt: -1 });
}
