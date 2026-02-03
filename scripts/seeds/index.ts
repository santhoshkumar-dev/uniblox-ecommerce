import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../../models/Product";
import { Discount } from "../../models/Discount";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env",
  );
}

async function seed() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to database.");

    // Clear existing data
    console.log("Clearing existing data...");
    await Product.deleteMany({});
    await Discount.deleteMany({});

    // Fetch products from Fake Store API
    console.log("Fetching products from Fakestore API...");
    // const response = await fetch("https://fakestoreapi.com/products");
    // const products = await response.json();
    const products: any[] = [
      {
        title: "Test Product",
        description: "Desc",
        price: 10,
        image: "img",
        category: "cat",
        rating: { rate: 5, count: 10 },
      },
    ];

    console.log(`Found ${products.length} products to seed.`);

    const productOps = products.map((p: any) => ({
      name: p.title,
      description: p.description,
      price: p.price,
      imageUrl: p.image,
      category: p.category,
      rating: p.rating,
      stock: Math.floor(Math.random() * 100) + 10, // Random stock between 10 and 110
    }));

    console.log("About to insert products...");
    await Product.insertMany(productOps);
    console.log("Products seeded successfully.");

    // Seed Discounts
    console.log("Seeding discounts...");
    const discounts = [
      {
        code: "WELCOME10",
        percentage: 10,
        isUsed: false,
      },
      {
        code: "SAVE20",
        percentage: 20,
        isUsed: false,
      },
      {
        code: "BIGSALE50",
        percentage: 50,
        isUsed: false,
      },
    ];

    await Discount.insertMany(discounts);
    console.log("Discounts seeded successfully.");

    console.log("Seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
