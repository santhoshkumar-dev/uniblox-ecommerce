import { Discount } from "@/models/Discount";
import { Order } from "@/models/Order";
import connectDB from "@/lib/db";
import crypto from "crypto";

const N_ORDER_THRESHOLD = 5; // Configurable
const DISCOUNT_PERCENTAGE = 10;

export async function validateDiscount(code: string, userId: string) {
  await connectDB();
  const discount = await Discount.findOne({ code });

  if (!discount) return null;
  if (discount.expiresAt && discount.expiresAt < new Date()) return null;

  // Check usage limits
  if (discount.usedCount >= discount.maxUses) return null;

  // Optional: Check if THIS user already used it (if we want 1 per user policy)
  // const hasUserUsed = discount.usageHistory.some(h => h.userId === userId);
  // if (hasUserUsed) return null;

  return discount;
}

export async function markDiscountUsed(
  code: string,
  userId: string,
  orderId: string,
) {
  await connectDB();

  // Atomically update
  const discount = await Discount.findOneAndUpdate(
    {
      code,
      $expr: { $lt: ["$usedCount", "$maxUses"] }, // Ensure we don't go over limit race-condition-style
    },
    {
      $inc: { usedCount: 1 },
      $push: { usageHistory: { userId, orderId, usedAt: new Date() } },
      // Sync legacy field for backward compat if needed, though strictly not required if we rely on counters
      $set: { isUsed: false }, // Actually we don't need to force this, but let's leave it alone or manage it.
      // If we want isUsed to represent "Exhausted":
      // isUsed: { $cond: { if: { $gte: ["$usedCount", "$maxUses"] }, then: true, else: false } } - bit complex for simple update
    },
    { new: true },
  );

  // If we want to flip the legacy 'isUsed' flag when exhausted:
  if (discount && discount.usedCount >= discount.maxUses) {
    await Discount.updateOne({ _id: discount._id }, { isUsed: true });
  }

  return discount;
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
      isPublic: false, // Private by default checking "shared via mail"
      maxUses: 1, // Single use reward
      usedCount: 0,
    });
    return code;
  }
  return null;
}

export async function createDiscount(data: {
  code: string;
  percentage: number;
  isPublic: boolean;
  maxUses: number;
  expiresAt?: Date;
}) {
  await connectDB();
  return await Discount.create({
    ...data,
    usedCount: 0,
    usageHistory: [],
  });
}

export async function getDiscounts(isAdmin = false) {
  await connectDB();
  if (isAdmin) {
    return await Discount.find({}).sort({ createdAt: -1 });
  }
  return await Discount.find({ isPublic: true, expiresAt: { $gt: new Date() } })
    .where({ $expr: { $lt: ["$usedCount", "$maxUses"] } })
    .sort({ createdAt: -1 });
}

export async function getPublicDiscounts() {
  await connectDB();
  // Return only active public discounts
  // Using $expr to compare fields usedCount < maxUses
  return await Discount.find({
    isPublic: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  }).where({ $expr: { $lt: ["$usedCount", "$maxUses"] } });
}
