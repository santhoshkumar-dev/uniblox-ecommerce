import { Cart, ICart } from "@/models/Cart";
import { Product } from "@/models/Product";
import connectDB from "@/lib/db";

export async function getCart(userId: string) {
  await connectDB();
  let cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number,
) {
  await connectDB();
  const cart = await getCart(userId);
  const product = await Product.findById(productId);

  if (!product) throw new Error("Product not found");
  if (product.stock < quantity) throw new Error("Insufficient stock");

  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId,
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId: product._id, quantity });
  }

  return await cart.save();
}

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number,
) {
  await connectDB();
  const cart = await getCart(userId);

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );
  } else {
    const item = cart.items.find(
      (item) => item.productId.toString() === productId,
    );
    if (item) {
      item.quantity = quantity;
    }
  }

  return await cart.save();
}

export async function clearCart(userId: string) {
  await connectDB();
  return await Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true });
}
