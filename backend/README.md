# FinzApp Backend

Backend API for FinzApp - Personal Finance Management for Colombia

## Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── strategies/      # JWT strategies
│   ├── guards/          # Auth guards
│   ├── dto/             # Data transfer objects
│   └── auth.*.ts        # Auth service/controller
├── users/               # Users module
├── transactions/        # Transactions module
├── categories/          # Categories module
├── reports/             # Reports module
├── ingest/              # SMS/Push ingestion
├── rules/               # Classification rules
├── budgets/             # Budgets module
├── common/              # Common filters, interceptors, decorators
├── prisma/              # Prisma ORM setup
├── app.module.ts        # Root module
└── main.ts              # Application entry point

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Database migrations

docker-compose.yml       # Docker Compose configuration
Dockerfile               # Multi-stage Docker build
```

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Setup environment variables
cp .env.example .env

# Run database migrations
npm run prisma:migrate
```

## Running the Application

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start
```

### Docker

```bash
# Build image
docker build -t finzapp-backend .

# Run container
docker run -p 3000:3000 --env-file .env finzapp-backend
```

## Database

### Migrations

```bash
# Create a new migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## API Documentation

Once the server is running, visit: `http://localhost:3000/api/docs`

## Authentication

The API uses JWT-based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Endpoints

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

## Module Features

### Users
- Get user profile
- Update profile (name, pay_day, monthly_budget)

### Transactions
- List transactions for current billing period
- Create manual transaction
- Update/confirm transaction category
- Delete transaction

### Categories
- Get system and custom categories
- Create custom category
- Automatic seeding of 7 system categories

### Reports
- Summary: income, expenses, budget status, projections
- Categories: spending breakdown with month-over-month comparison
- Ants: small spending habits analysis (< COP 30k, 3+ occurrences)

### Rules
- Get classification rules
- Create pattern-based rules (regex)
- Update/delete rules
- Toggle rule activation

### Budgets
- Get budgets by month
- Create category budgets
- Update/delete budgets

### Ingest
- SMS ingestion: `POST /api/v1/ingest/sms`
- Push ingestion: `POST /api/v1/ingest/push`
- Calls NLP service for parsing
- Auto-classifies with user rules

## Environment Variables

See `.env.example` for all available variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing key
- `NLP_SERVICE_URL` - NLP microservice URL
- `INGEST_API_KEY` - API key for SMS/Push ingest

## Testing

```bash
npm run test
npm run test:coverage
```

## Linting

```bash
npm run lint
```

## Logging

Winston logger configured for:
- Console output (development)
- File logging (logs/error.log, logs/combined.log)
- JSON format for production

## Rate Limiting

Global rate limit: 100 requests per minute per IP
