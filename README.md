# NovaStore E-Commerce Platform

A complete, production-ready full-stack online store built with React, Node.js, Express, MongoDB, and Stripe.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+ and npm
- Git

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** — copy and fill in `backend/.env`:
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGO_URI=memory                    # Use 'memory' for zero-config local dev
JWT_SECRET=your_random_secret_here
JWT_EXPIRE=30d
STRIPE_SECRET_KEY=sk_test_...       # Your Stripe test key
```

**Frontend** — copy and fill in `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...   # Your Stripe publishable test key
```

### 3. Seed the Database (Optional - adds demo data)

```bash
cd backend
node seed.js
```
This creates:
- Admin: `admin@example.com` / `admin123456`
- Customer: `customer@example.com` / `customer123456`
- 8 sample products

### 4. Run Development Servers

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
# Server runs at http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
# UI runs at http://localhost:5173
```

---

## 🧪 Test Accounts & Stripe Cards

| Account       | Email                        | Password        |
|---------------|------------------------------|-----------------|
| Admin         | `admin@example.com`          | `admin123456`   |
| Customer      | `customer@example.com`       | `customer123456`|

| Card              | Number                | Expected Result   |
|-------------------|-----------------------|-------------------|
| Success Card      | `4242 4242 4242 4242` | Payment approved  |
| Declined Card     | `4000 0000 0000 0002` | Payment declined  |

Use any future expiration date and any 3-digit CVC for test cards.

---

## 📐 Architecture

```
ecommerce-store/
├── backend/          (Node.js + Express API)
│   ├── src/
│   │   ├── config/   (MongoDB connection)
│   │   ├── models/   (User, Product, Order)
│   │   ├── controllers/ (auth, products, orders, payments)
│   │   ├── middleware/  (auth JWT, adminOnly, error handler)
│   │   └── routes/   (auth, products, orders, payments, health)
│   └── server.js
└── frontend/         (React + Vite)
    └── src/
        ├── api/      (Centralized HTTP client)
        ├── context/  (AuthContext, CartContext)
        ├── components/ (Navbar, Footer, ProductCard, ProtectedRoute, AdminRoute)
        └── pages/    (Home, ProductList, ProductDetail, Cart, Checkout, Login, Register, MyOrders, Admin)
```

**Security Rules:**
- Frontend never talks to MongoDB or Stripe directly
- All prices are calculated server-side from the database
- Admin routes verified server-side via JWT role claim
- No secrets committed to Git (use .env + platform env vars)

---

## 🌐 Deployment (Free Tier)

| Service  | Platform       | Free Tier    |
|----------|----------------|--------------|
| Database | MongoDB Atlas  | 512MB        |
| Backend  | Render         | 750 hrs/mo   |
| Frontend | Vercel         | Unlimited    |

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete step-by-step guide.

---

## 🔑 API Endpoints

| Method | Endpoint                     | Access      |
|--------|------------------------------|-------------|
| POST   | /api/auth/register           | Public      |
| POST   | /api/auth/login              | Public      |
| GET    | /api/products                | Public      |
| GET    | /api/products/:id            | Public      |
| POST   | /api/products                | Admin Only  |
| PUT    | /api/products/:id            | Admin Only  |
| DELETE | /api/products/:id            | Admin Only  |
| POST   | /api/orders                  | Customers   |
| GET    | /api/orders/my               | Customers   |
| GET    | /api/orders                  | Admin Only  |
| PUT    | /api/orders/:id/status       | Admin Only  |
| POST   | /api/create-payment-intent   | Customers   |
| GET    | /api/health                  | Public      |
