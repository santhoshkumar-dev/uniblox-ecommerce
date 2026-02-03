import { Product, IProduct } from "@/models/Product";
import connectDB from "@/lib/db";

export async function createProduct(data: Partial<IProduct>) {
  await connectDB();
  return await Product.create(data);
}

export async function getAllProducts() {
  await connectDB();
  return await Product.find({}).sort({ createdAt: -1 });
}

export async function getProductById(id: string) {
  await connectDB();
  return await Product.findById(id);
}

export async function updateProduct(id: string, data: Partial<IProduct>) {
  await connectDB();
  return await Product.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteProduct(id: string) {
  await connectDB();
  return await Product.findByIdAndDelete(id);
}
