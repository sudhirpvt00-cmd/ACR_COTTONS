# 🪡 Dhanu Textile — E-Commerce Web Application

A modern, mobile-first e-commerce web platform for **Dhanu Textile** (authentic handwoven sarees, pure fabrics, and ethnic dress materials). Built with a clean tech stack inspired by a streamlined Amazon/Myntra shopping experience: fast, responsive, and secure.

---

## 🏗️ Architecture & Tech Stack

- **Frontend (`/client`)**: React 18, Vite, Tailwind CSS, React Router v6, Lucide React icons.
- **Backend (`/server`)**: Node.js, Express, Prisma ORM, SQLite (`dev.db`), JWT in `httpOnly` secure cookies, bcrypt password hashing.
- **Security & Validation**: Zod request schema validation, Helmet security headers, CORS origin protection, Express rate limiting (OTP request and login brute-force guards).
- **OTP Service Abstraction**: Pluggable provider system supporting:
  - `dev` mode: Generates 6-digit OTPs, logs formatted boxes to the server console, and provides dev banner auto-fill.
  - `msg91` provider: Indian SMS gateway integration stub.
  - `twilio` provider: Global SMS carrier gateway integration stub.
  - *OTPs are always stored hashed with bcrypt in the database — never stored in plain text.*

---

## 📁 Project Folder Structure

```
Dhanu_textile_website/
├── client/                     # Frontend React + Vite application
│   ├── index.html              # HTML shell with Playfair Display & Plus Jakarta fonts
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js      # Palette: maroon, terracotta/amber, warm cream, charcoal
│   ├── vite.config.js          # Config with /api proxy to localhost:5000
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   │   ├── AuthLayout.jsx            # Textile brand shell & trust badges
│       │   │   ├── StepProgress.jsx          # 3-step registration progress bar
│       │   │   ├── PasswordStrengthMeter.jsx # Visual meter & requirements checklist
│       │   │   └── ProtectedRoute.jsx        # Session guard with redirect to /login
│       │   └── common/
│       │       ├── Button.jsx                # Gradient orange button with arrow
│       │       ├── Input.jsx                 # Small uppercase labels & left icons
│       │       └── DevOtpBanner.jsx          # Dev mode OTP copy & autofill helper
│       ├── context/
│       │   ├── AuthContext.jsx               # User session, login, logout, getMe
│       │   └── ToastContext.jsx              # Toast alerts (success, error, info)
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── LoginPage.jsx             # Mobile + password login
│       │   │   ├── RegisterPage.jsx          # Step 1: Info -> Step 2: OTP -> Step 3: Password
│       │   │   └── ForgotPasswordPage.jsx    # Mobile -> OTP -> Reset password
│       │   └── DashboardPlaceholder.jsx      # Phase 1 verified customer dashboard
│       ├── services/
│       │   └── api.js                        # Authenticated fetch wrapper
│       ├── utils/
│       │   └── validators.js                 # 10-digit mobile, email, & password validators
│       ├── App.jsx                           # Route switch & auth redirect
│       ├── main.jsx
│       └── index.css
│
├── server/                     # Backend Node.js + Express API
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma       # Database models (User, Otp, Category, Product, Order...)
│   │   └── seed.js             # Initial demo catalog & accounts
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js          # Environment config defaults
│   │   │   └── prisma.js       # Prisma client singleton
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # Cookie JWT verification
│   │   │   ├── rateLimiter.js         # OTP & login rate limiters
│   │   │   └── validateMiddleware.js  # Zod validator
│   │   ├── routes/
│   │   │   └── authRoutes.js
│   │   ├── services/
│   │   │   ├── otpService.js          # OTP generation, hashing, attempt tracking
│   │   │   ├── tokenService.js        # JWT sign, verify, and httpOnly cookies
│   │   │   └── otpProviders/
│   │   │       ├── devOtpProvider.js
│   │   │       ├── msg91Provider.js
│   │   │       └── twilioProvider.js
│   │   ├── utils/
│   │   │   ├── hash.js                # Bcrypt hashing & compare
│   │   │   └── logger.js              # Console logger & dev banners
│   │   ├── validations/
│   │   │   └── authSchemas.js         # Zod schemas for all auth payloads
│   │   └── server.js                  # Express app listener
│   └── tests/
│       └── authFlow.test.js           # Automated 12-stage E2E test suite
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 2. Environment Configuration
Copy the `.env.example` file into `server/.env`:
```bash
cp .env.example server/.env
```

Review `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="file:./dev.db"
JWT_SECRET=super_secret_jwt_encryption_key_change_in_production_textile_shop
JWT_EXPIRES_IN=7d
COOKIE_NAME=dhanu_auth_token

# OTP Settings
OTP_PROVIDER=dev
OTP_EXPIRY_MINUTES=5
OTP_RESEND_WAIT_SECONDS=30
OTP_MAX_ATTEMPTS=5
```

### 3. Install Dependencies
In the root directory, install dependencies for both server and client:
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 4. Database Setup & Seeding
From the `server/` directory:
```bash
cd server
npx prisma db push
npm run db:seed
```
This initializes the SQLite database (`dev.db`) and seeds:
- **Admin Account**: `9876543210` / `Admin@12345`
- **Customer Account**: `9876501234` / `Customer@12345`
- **Catalog**: 4 Categories & 5 Handloom Silk/Cotton products

---

## 🏃 Running the Application

Open two terminal windows:

### Terminal 1 (Backend Server)
```bash
cd server
npm start
# Server starts at http://localhost:5000
```

### Terminal 2 (Frontend Client)
```bash
cd client
npm run dev
# Client starts at http://localhost:5173
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser. Unauthenticated users are redirected to the Login page.

---

## 🧪 Testing Phase 1 Authentication Flow

Run the automated integration test script from the `server/` folder:
```bash
cd server
npm run test:auth
```

The test validates 12 end-to-end stages:
1. Registration Step 1: Send OTP to new mobile number
2. Duplicate mobile check (409 Conflict rejection)
3. Registration Step 2: Invalid OTP check (400 Bad Request)
4. Registration Step 2: Valid OTP verification
5. Registration Step 3: Weak password rejection
6. Registration Step 3: Strong password creation, user record creation, httpOnly JWT cookie
7. Profile check via `/api/auth/me` with cookie authentication
8. Logout via cookie invalidation
9. Login with new credentials
10. Login failure on incorrect password (401 Unauthorized)
11. Forgot password 3-step OTP recovery flow
12. Sign-in verification with newly reset password

---

## 📲 Switching OTP from DEV Mode to Real SMS Gateway

In `server/.env`, change `OTP_PROVIDER`:

### For MSG91 (India)
1. Set `OTP_PROVIDER=msg91` in `server/.env`.
2. Populate the MSG91 configuration keys:
   ```env
   MSG91_AUTH_KEY=your_msg91_authkey
   MSG91_TEMPLATE_ID=your_dlt_approved_template_id
   MSG91_SENDER_ID=DHANUT
   ```
3. The provider will automatically dispatch real SMS OTPs to `+91<mobile>`.

### For Twilio (Global)
1. Set `OTP_PROVIDER=twilio` in `server/.env`.
2. Populate your Twilio credentials:
   ```env
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
   ```
3. The provider will dispatch SMS via Twilio REST API.

---

## 🎨 Design Theme & UI Guidelines Implemented

- **Palette**: Deep maroon (`#8A182B`), warm burnt orange & amber (`#D9531E`, `#D97706`), cream background (`#FAF7F2`), and soft charcoal text (`#1F2937`).
- **Typography**: Serif (`Playfair Display`) for headings and traditional elegance; clean sans-serif (`Plus Jakarta Sans`) for body readability.
- **Login UI Style**:
  - Small uppercase labels (`text-[11px] font-bold tracking-wider uppercase text-stone-600`)
  - Rounded inputs with left icons (Phone, Lock, User, Email)
  - Full-width orange gradient button with right arrow
  - Centered "New user? Register & Create Account" link
  - Interactive show/hide password toggle
  - In DEV mode, a helper banner with 1-click OTP auto-fill is rendered for effortless testing.
