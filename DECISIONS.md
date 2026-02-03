# Design Decisions

## Decision 1: Database-First Approach vs In-Memory

**Context:** The assignment allowed for an in-memory store, but required a robust backend implementation.
**Options Considered:**

- **Option A:** In-Memory storage (Arrays/Maps). Fastest implementation, no setup, but data lost on restart. Harder to query complex relationships.
- **Option B:** MongoDB (via Mongoose). Persistent, supports rich querying, popular in Node ecosystem.

**Choice:** Option B: MongoDB.
**Why:**

- Persistence is crucial for "e-commerce" simulations (carts, orders).
- The Mongoose schema definitions (`Cart`, `Order`, `Discount`) serve as self-documenting code.
- It allows for atomic operations (e.g., `findOneAndUpdate` for inventory and discount usage counting), which significantly simplifies concurrency handling compared to implementing manual locks in-memory.

## Decision 2: Hybrid Discount System (Public vs Private)

**Context:** The prompt asked for "nth order" code generation (Private) but also "discount codes can be applied at checkout" (Public usage).
**Options Considered:**

- **Option A:** Single "Discount" table where all codes are treated equal.
- **Option B:** Separation of concerns with properties `isPublic`, `maxUses`, and `usedCount`.

**Choice:** Option B.
**Why:**

- It allows flexibility. We can support the automatic "nth order" reward (Private, single-use, auto-generated) AND marketing campaigns (Public, multi-use like "SUMMER2026") using the same underlying `DiscountService`.
- Prevents the awkwardness of a generated user-specific code being leaked and used by everyone.

## Decision 3: Server-Side Cart Quantity Management

**Context:** Managing product quantities in the cart and synchronizing with stock.
**Options Considered:**

- **Option A:** Client-side cart state (Context/Redux) synced to DB only on checkout.
- **Option B:** Server-side source of truth (Database).

**Choice:** Option B.
**Why:**

- E-commerce requires stock validation. Storing cart state on the server allows us to validate inventory _before_ checkout (during add-to-cart).
- Allows a user to log in from a different device and see their cart.
- I implemented an "Optimistic UI" pattern on the frontend to mask the network latency, giving the "snappy" feel of Option A with the reliability of Option B.

## Decision 4: Next.js App Router for Unified Stack

**Context:** Need to build both APIs and a potential Frontend (as a plus).
**Options Considered:**

- **Option A:** Express.js API + Separate React SPA.
- **Option B:** Next.js (Full Stack).

**Choice:** Option B.
**Why:**

- Reduces boilerplate. API Routes (`app/api/`) live next to the UI.
- Server Actions and Server Components allow fetching data (like products in the `ProductPage`) directly without exposing an API endpoint if not strictly needed (though I exposed one for client-side flexibility).
- Simplifies deployment and Type sharing models between frontend and backend.

## Decision 5: Atomic Discount Usage Tracking

**Context:** Ensuring the "nth order" discount or limited-use coupons aren't exploited by race conditions.
**Options Considered:**

- **Option A:** Read -> Check -> Write. (Fetch discount, check `usedCount`, save).
- **Option B:** Atomic Database Update (`findOneAndUpdate` with conditions).

**Choice:** Option B.
**Why:**

- In a high-traffic store, two users might try to claim the last use of a generic coupon simultaneously.
- I used Mongoose's query syntax: `{ code: "CODE", $expr: { $lt: ["$usedCount", "$maxUses"] } }` to ensure the increment only happens if the limit hasn't been breached, delegating the locking/consistency to the database engine.
