# Expense Tracker API

A RESTful API for tracking expenses and income, built with Node.js, Express, TypeScript, and PostgreSQL with Drizzle ORM.

## Features

- **Authentication** - User registration, login, and profile management with JWT
- **CRUD Operations** - Manage expenses and income
- **Transaction History** - Get transaction history for the last 30 or 60 days
- **CSV Downloads** - Export your expenses and income as CSV files
- **Protected Routes** - All resource access is protected via authentication

## Tech Stack

- TypeScript
- Node.js
- Express
- PostgreSQL
- Drizzle ORM
- JWT for authentication
- bcrypt for password hashing

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get user profile (protected)

### Expenses

- `GET /api/expenses` - Get all expenses (protected)
- `POST /api/expenses` - Create a new expense (protected)
- `GET /api/expenses/:id` - Get expense by ID (protected)
- `PATCH /api/expenses/:id` - Update an expense (protected)
- `DELETE /api/expenses/:id` - Delete an expense (protected)
- `GET /api/expenses/history/:days` - Get expenses history for last 30 or 60 days (protected)
- `GET /api/expenses/download/csv` - Download expenses as CSV (protected)

### Incomes

- `GET /api/incomes` - Get all incomes (protected)
- `POST /api/incomes` - Create a new income (protected)
- `GET /api/incomes/:id` - Get income by ID (protected)
- `PATCH /api/incomes/:id` - Update an income (protected)
- `DELETE /api/incomes/:id` - Delete an income (protected)
- `GET /api/incomes/history/:days` - Get incomes history for last 30 or 60 days (protected)
- `GET /api/incomes/download/csv` - Download incomes as CSV (protected)

### Transactions

- `GET /api/transactions` - Get all transactions (protected)
- `GET /api/transactions/history/:days` - Get transactions for the last 30 or 60 days (protected)
- `GET /api/transactions/download/csv` - Download all transactions as CSV (protected)

### Utility Endpoints

- `GET /api/health` - Check if the API is running
- `GET /api/docs` - API documentation

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL
- pnpm (or npm/yarn)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up your environment variables in `.env`:
   ```
   PORT=8000
   DATABASE_URL=postgres://username:password@localhost:5432/expense_tracker
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```
4. Run database migrations:
   ```bash
   pnpm db:push
   ```
5. Start the development server:
   ```bash
   pnpm dev
   ```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm db:push` - Push schema changes to the database
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio to explore your database

## API Testing

The repository includes a `.http` file for testing API endpoints with REST Client extension in VS Code. See `src/test/api.http`.
