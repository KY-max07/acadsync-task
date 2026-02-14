# AcadSync Client

The frontend application for AcadSync, built with React, TypeScript, and Vite.

## Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Routing**: [React Router DOM 7](https://reactrouter.com/)
- **State Management**: React Context (Auth, Subscription)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components (Common & Specific)
│   ├── context/        # React Context providers (AuthContext, etc.)
│   ├── hooks/          # Custom hooks (useAuth, useClickOutside)
│   ├── pages/          # Page components (Landing, Dashboard, Auth)
│   ├── services/       # API service functions (axios setup)
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Helper functions (cn, format currency)
│   ├── App.tsx         # Main App component with Routes
│   └── main.tsx        # Entry point
└── ...
```

## Key Features

- **Authentication**: Login and Registration pages with JWT handling.
- **Dynamic Pricing**: Real-time pricing calculation on the landing page and registration wizard.
- **Dashboard**: Role-based redirection to specific dashboards (Student, Teacher, Admin).
- **Subscription Management**: Upgrade flows and billing cycle management.

## Setup & Installation

**Prerequisites:** Node.js (v16+)

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the `client/` directory (optional, defaults are usually set in code or vite config):

    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

3.  **Run Development Server**:

    ```bash
    npm run dev
    ```

    Access the app at `http://localhost:5173`.

## Build for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist/` directory.
