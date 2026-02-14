# AcadSync

AcadSync is a modern, full-stack School Management System designed to streamline administrative operations for educational institutions. It offers a comprehensive solution for managing users, subscriptions, and role-based access to specialized portals (Student, Teacher, School Admin).

## Key Features

- **Dynamic Landing Page**: Responsive design with pricing toggles and feature showcases.
- **Multi-Step Registration Wizard**: A seamless onboarding flow collecting user details, plan selection, and payment processing.
- **Role-Based Access Control (RBAC)**: Distinct portals for Students, Teachers, and Admins based on subscription tiers.
- **Subscription Management**:
  - Tiered Plans: Individual, Organization, and Custom.
  - Billing Cycles: Monthly and Yearly billing options.
  - Upgrades: Users can upgrade plans or switch billing cycles.
- **Admin Dashboard**:
  - User Management (View, Search, Delete).
  - Dynamic Pricing Configuration (Update plan prices in real-time).
  - Financial Analytics (Estimated Revenue, Active Subscriptions).
- **Secure Authentication**: JWT-based auth with protected routes and persistent login state.
- **Responsive Design**: Fully optimized for Mobile, Tablet, and Desktop.

## Technology Stack

### Frontend (Client)

- **Core**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), `clsx`, `tailwind-merge`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM 7](https://reactrouter.com/)
- **State & Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) (Validation)
- **UI Components**: Custom components (Button, Input, Modal, Wizard)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend (Server)

- **Runtime**: [Node.js](https://nodejs.org/), [Express.js 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/), [Mongoose 9](https://mongoosejs.com/)
- **Authentication**: JSON Web Tokens (JWT), `bcryptjs` for password hashing
- **Security**: `helmet` (Headers), `cors` (Cross-Origin Resource Sharing), `express-rate-limit` (DDoS protection)
- **Validation**: `zod` for request validation
- **Utilities**: `dotenv` for environment configuration

## Project Structure

```
acadsync/
├── client/                 # Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI components (Button, Input, Layout)
│   │   ├── context/        # React Context (Auth, Theme, Subscription)
│   │   ├── hooks/          # Custom Hooks (useAuth, useSubscription)
│   │   ├── pages/          # Application Pages (Landing, Dashboard, Register)
│   │   ├── services/       # API integration (axios instance)
│   │   └── ...
│   └── ...
├── server/                 # Backend Application
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Route logic
│   │   ├── middleware/     # Auth, Rate Limiting
│   │   ├── models/         # Mongoose Schemas (User, Subscription)
│   │   ├── routes/         # Express Routes
│   │   └── index.ts        # Entry point
│   └── ...
└── README.md               # Project Documentation
```

## User Workflow

1.  **Landing & Discovery**:
    - Users visit the landing page to view features and pricing.
    - Can toggle between Monthly/Yearly pricing to see savings.

2.  **Registration (Wizard Flow)**:
    - **Step 1**: Enter personal details (Name, Email, Organization Type).
    - **Step 2**: Select a Plan (Individual, Organization, Custom).
      - _Individual_: Single user.
      - _Organization_: Includes all roles (Student, Teacher, School).
      - _Custom_: Select specific roles tailored to needs.
    - **Step 3**: Payment. Mock payment processing with Card or UPI validation.
    - **Step 4**: Confirmation. Account and Subscription are created atomically.

3.  **Access & Usage**:
    - Users log in and are directed to the **Dashboard**.
    - Dashboard shows active portals based on the subscription.
    - Users can access their specific portals (e.g., `/student`, `/teacher`).

4.  **Management**:
    - **My Purchases**: Users can view current plan details, renewal dates, and upgrade their subscription.
    - **Admin**: System admins can log in to `/admin` to manage users and update global pricing configurations.

## API Reference

### Authentication (`/api/auth`)

| Method | Endpoint                      | Description                                    | Protected | Request Body / Params                                                                                                                |
| :----- | :---------------------------- | :--------------------------------------------- | :-------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/register`                   | Register a basic user.                         | No        | `{ name, email, password, phoneNumber, organizationType }`                                                                           |
| `POST` | `/register-with-subscription` | Register user + create subscription + payment. | No        | `{ name, email, password, phoneNumber, organizationType, subscriptionPlan, paymentMethod, amount, billingCycle?, portalsIncluded? }` |
| `POST` | `/login`                      | Authenticate user.                             | No        | `{ email, password }`                                                                                                                |

### Subscription (`/api/subscription`)

| Method | Endpoint   | Description                      | Protected | Request Body / Params                                              |
| :----- | :--------- | :------------------------------- | :-------- | :----------------------------------------------------------------- |
| `GET`  | `/me`      | Get current user's subscription. | **Yes**   | -                                                                  |
| `POST` | `/upgrade` | Upgrade plan or change billing.  | **Yes**   | `{ planId, billingCycle, portalsIncluded, paymentMethod, amount }` |

### Admin (`/api/admin`)

| Method   | Endpoint     | Description                             | Protected       | Request Body / Params  |
| :------- | :----------- | :-------------------------------------- | :-------------- | :--------------------- |
| `GET`    | `/users`     | Get all users with subscription status. | **Yes (Admin)** | -                      |
| `DELETE` | `/users/:id` | Delete a user.                          | **Yes (Admin)** | `id` (URL Param)       |
| `GET`    | `/pricing`   | Get current pricing config.             | No              | -                      |
| `PUT`    | `/pricing`   | Update pricing plans.                   | **Yes (Admin)** | `{ plans, rolePrice }` |

### Pricing (`/api/pricing`)

| Method | Endpoint     | Description                | Protected | Request Body / Params                                                    |
| :----- | :----------- | :------------------------- | :-------- | :----------------------------------------------------------------------- |
| `POST` | `/calculate` | Calculate price breakdown. | No        | `{ subscriptionType, selectedPortals, selectedFeatures, billingCycle? }` |

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (Local running instance or Atlas URI)

### 1. Server Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/acadsync
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Start the server:

```bash
npm run dev
```

### 2. Client Setup

```bash
cd client
npm install
```

Start the client:

```bash
npm run dev
```

Access the app at `http://localhost:5173`.
