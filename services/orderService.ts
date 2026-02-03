import { Order } from "@/models/Order";
import { Cart } from "@/models/Cart";
import { Product } from "@/models/Product";
import * as CartService from "./cartService";
import * as DiscountService from "./discountService";
import connectDB from "@/lib/db";

export async function createOrder(userId: string, discountCode?: string) {
  await connectDB();
  const cart = await CartService.getCart(userId);

  if (!cart.items.length) throw new Error("Cart is empty");

  let subtotal = 0;
  const orderItems = [];

  // Server-side price calculation and stock verification
  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    if (product.stock < item.quantity)
      throw new Error(`Insufficient stock for ${product.name}`);

    // Decrement stock (Optimistic locking or atomic update preferred, keeping simple here)
    product.stock -= item.quantity;
    await product.save();

    subtotal += product.price * item.quantity;
    orderItems.push({
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: item.quantity,
    });
  }

  let discountAmount = 0;
  let finalAmount = subtotal;

  if (discountCode) {
    const discount = await DiscountService.validateDiscount(
      discountCode,
      userId,
    );
    if (discount) {
      discountAmount = (subtotal * discount.percentage) / 100;
      finalAmount = subtotal - discountAmount;
    } else {
      throw new Error("Invalid or expired discount code");
    }
  }

  const order = await Order.create({
    userId,
    items: orderItems,
    subtotal,
    discountCode,
    discountAmount,
    finalAmount,
    status: "PAID", // Simulating immediate payment
  });

  if (discountCode) {
    await DiscountService.markDiscountUsed(
      discountCode,
      userId,
      order._id as string,
    );
  }

  // Clear cart
  await CartService.clearCart(userId);

  // Trigger Discount Generation logic
  await DiscountService.checkAndGenerateDiscount();

  return order;
}

export async function getUserOrders(userId: string) {
  await connectDB();
  return await Order.find({ userId }).sort({ createdAt: -1 });
}

export async function getAnalytics() {
  await connectDB();
  const totalRevenue = await Order.aggregate([
    { $match: { status: { $ne: "CANCELLED" } } },
    { $group: { _id: null, total: { $sum: "$subtotal" } } },
  ]);

  const totalItemsSold = await Order.aggregate([
    { $match: { status: { $ne: "CANCELLED" } } },
    { $unwind: "$items" },
    { $group: { _id: null, count: { $sum: "$items.quantity" } } },
  ]);

  const totalDiscountGiven = await Order.aggregate([
    { $match: { status: { $ne: "CANCELLED" } } },
    { $group: { _id: null, total: { $sum: "$discountAmount" } } },
  ]);

  return {
    revenue: totalRevenue[0]?.total || 0,
    itemsSold: totalItemsSold[0]?.count || 0,
    discountGiven: totalDiscountGiven[0]?.total || 0,
  };
}
