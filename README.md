# Uniblox E-commerce Platform

A production-ready e-commerce system built with Next.js 15, MongoDB, Better Auth, and ShadCN UI.

## Features

- **Product Management**: Admin CRUD for products.
- **Cart System**: User-scoped, server-side validation, persistent in DB.
- **Checkout**: Order creation, stock management, optimistic locking (basic).
- **Discount Engine**: Automated 10% discount code generation for every 5th global order.
- **Authentication**: Role-based access (USER/ADMIN) via Better Auth.
- **Analytics**: Admin dashboard for revenue and sales tracking.

## Architecture

- **/lib**: Core utilities (DB connection, Auth configuration).
- **/models**: Mongoose schemas (Product, Order, Cart, Discount, User).
- **/services**: Business logic layer (decoupled from API routes).
- **/app/api**: Thin route handlers.
- **/components**: Shadcn UI + Application components.

## Setup

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` and configure:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `BETTER_AUTH_SECRET`: Random string.
   - `BETTER_AUTH_URL`: `http://localhost:3000`

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Admin Setup

To become an admin:

1. Register a new user via `/register`.
2. Access your MongoDB database (collection: `user`).
3. Update your user document: set `"role": "ADMIN"`.
   _(Or use a seeding script if provided)_.

## Discount Logic

The system automatically rewards loyal usage platform-wide.

- **Trigger**: Every 5th order (`N_ORDER_THRESHOLD = 5` in `services/discountService.ts`).
- **Reward**: A unique 10% discount code.
- **Validity**: 7 days, one-time use.
- **Validation**: Codes are checked at checkout for validity and expiry.

## License

MIT
