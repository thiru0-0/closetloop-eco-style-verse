# 👗 ClosetLoop Eco Style Verse

A full-stack sustainable fashion platform enabling outfit rentals, AI stylist recommendations, clothing swaps, and retailer store management. Built for scalability, eco-conscious shopping, and modern UX.

---

## 🚀 Frontend Features (React + Tailwind CSS + Radix UI)

### 🔐 Authentication Pages
1. **SignIn.tsx** – User login with JWT token storage and role-based redirect.
2. **SignUp.tsx** – User and Retailer registration with conditional fields.

### 📄 Core Pages
- **Browse.tsx** – Outfit listing, search, and filtering with mock and real data.
- **Profile.tsx** – Role-aware profile display with tabs for users and retailers.
- **Store.tsx** – Retailer-only dashboard for managing outfits (CRUD operations).
- **Cart.tsx** – Persistent shopping cart with quantity updates and price calculations.
- **AIStylist.tsx** *(Under development)* – UI placeholder for AI-based outfit recommendations.
- **SwapMarket.tsx** *(Under development)* – Clothing exchange marketplace.
- **NotFound.tsx** – 404 fallback page.
- **Index.tsx** – Landing page with hero section and platform overview.

### 🧩 Reusable Components
- **Navigation.tsx** – Role-aware responsive navbar with cart indicator.
- **OutfitCard.tsx** – Displays outfit details with Add to Cart and AR Try-On buttons.
- **Common UI Elements** – Custom buttons, tabs, dialogs, and toasters based on Radix UI.

### 🌐 Navigation & State Management
- Role-based routes using React Router.
- Local state and `localStorage` for JWT, cart, and role tracking.
- Conditional rendering across components based on user type.

---

## 🧪 Backend Features (Express + MongoDB + JWT)

### 🧬 Models
- **User** – User and retailer accounts with fields like name, role, email, password, and store details.
- **Outfit** – Outfit metadata for rent/swap including sustainability info.
- **Order**, **Rental**, **Swap**, **Notification**, **Cart** – Transactional and utility models.

### 🛣️ Routes & Controllers
- **Auth** – JWT-based login and registration with password hashing.
- **Profile** – Role-based profile retrieval with JWT auth.
- **Outfit**, **Cart**, **Store**, **Swap**, **Rental**, **Notification** – REST APIs with full validation and role access control.

### 🔒 Security & Middleware
- JWT token authentication and role-based authorization.
- `bcrypt` for password hashing, `express-validator` for request validation.
- Helmet, CORS, and rate limiting middleware configured for protection.

---

## 🧾 API Instructions: Registering Users & Retailers

### 👤 Create User Account

**POST** `/api/auth/signup`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "user"
}

🏪 Create Retailer Account
POST /api/auth/signup

{
  "name": "Alice Retail",
  "email": "retailer@example.com",
  "password": "RetailPass456",
  "role": "retailer",
  "storeName": "Alice Fashion",
  "gstNumber": "29ABCDE1234F2Z5",
  "businessLicense": "LIC123456",
  "storeAddress": "123 Fashion Street, NY",
  "pincode": "10001",
  "storeCategory": "Traditional"
}

🔐 Note: Use /api/auth/login to authenticate and receive a JWT token for subsequent authorized routes.
