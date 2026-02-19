# Ecommerce (Next.js + Prisma + SQL Server)

Clean full-stack ecommerce implementation with:
- Catalog (home/products/product detail)
- Quick OTP sign-in (name + phone)
- Server-backed cart with cookie session
- Simplified checkout (UPI/Card) + order creation
- Inventory/availability checks at add-to-cart and checkout

## Tech
- Next.js (App Router)
- Prisma + SQL Server
- React + Tailwind CSS

## Setup
1. Install dependencies:
```bash
npm install
```
2. Configure database:
- Copy `.env.example` to `.env`
- Set `DATABASE_URL`

3. Reset schema and seed data (data loss accepted):
```bash
npm run prisma:reset
```

4. Run app:
```bash
npm run dev
```

## Quick Sign-In + OTP
- Route: `GET /signin`
- Enter name + phone, then verify OTP to continue.
- Demo default OTP: `123456`

## Main API Routes
- `GET /api/home`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/auth/otp`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`
- `DELETE /api/cart/items/:itemId`
- `DELETE /api/cart`
- `POST /api/checkout`
- `GET /api/orders/:orderNumber`

## Admin Dashboard
- Route: `GET /admin`
- Controls:
  - Create categories
  - Create products with first variant
  - Toggle product active/featured flags
  - Update variant stock
  - Update order status/payment/fulfillment states
