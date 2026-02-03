import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import connectDB from "./db";

// Ensure DB is connected
connectDB();

export const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection.db as any),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
    },
  },
});
