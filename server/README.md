# AcadSync Server

The backend API for the AcadSync application.

## Scripts

- `npm run dev`: Runs the server in development mode using `ts-node-dev` (or similar).
- `npm run build`: Compiles TypeScript to JavaScript.
- `npm start`: Runs the compiled JavaScript from `dist/`.

## API Endpoints

- **/api/auth**: Authentication (Login, Register).
- **/api/subscription**: Subscription management (Upgrade, Status).
- **/api/admin**: Admin-only routes (Users, Pricing).
- **/api/pricing**: Public pricing configuration.

## Environment Variables

See `.env.example` for required keys.
