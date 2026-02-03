# Uniblox E-commerce Assessment

A full-stack e-commerce application built with Next.js, TypeScript, and MongoDB.

## Features implemented

1.  **Product Management**: Browse products, view details, and manage inventory.
2.  **Cart System**:
    - Server-side persistent cart.
    - Optimistic UI for instant quantity updates.
    - Stock validation prevents adding more than available.
3.  **Discount Engine**:
    - **Architecture**: Supports both Public (multi-use) and Private (single-use) codes.
    - **Automated Rewards**: Every Nth order (default: 5) automatically generates a private, single-use discount code.
    - **Validation**: Robust API to check validity, expiry, and usage limits before checkout.
4.  **Admin Dashboard**:
    - Create and manage custom discount codes.
    - Analytics dashboard showing Revenue, Items Sold, and Discounts Given.
5.  **Checkout Flow**:
    - Apply coupons.
    - Place orders with atomic stock deduction.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Styling**: Tailwind CSS
- **Authentication**: Better-Auth

## Setup Instructions

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root:
    ```env
    MONGODB_URI=mongodb://localhost:27017/uniblox-ecommerce
    BETTER_AUTH_SECRET=your_secret
    BETTER_AUTH_URL=http://localhost:3000
    ```
4.  **Seed the Database** (Optional but recommended):
    ```bash
    npm run seed
    ```
5.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Testing

The project includes unit tests for the core business logic.

```bash
npm test
```

## API Documentation

### Cart

- `GET /api/cart`: Fetch current user's cart.
- `POST /api/cart`: Add item (requires `{ productId, quantity }`).
- `PUT /api/cart`: Update quantity.

### Checkout & Orders

- `POST /api/discounts/validate`: Check if a code is valid.
- `POST /api/checkout`: Place order.
- `GET /api/user/orders`: Get order history.

### Admin

- `GET /api/admin/analytics`: key performance metrics.
- `POST /api/admin/discounts`: Create manual discount codes.
