# Backend Setup Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update the following variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Change this to a strong random string
- `JWT_REFRESH_SECRET` - Change this to a strong random string
- `INGEST_API_KEY` - Change this to a strong random string
- `NLP_SERVICE_URL` - URL where NLP service is running

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed system categories
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
API documentation at `http://localhost:3000/api/docs`

## Docker Setup

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

Services:
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Building Docker Image

```bash
docker build -t finzapp-backend:latest .

docker run -p 3000:3000 \
  --env-file .env \
  finzapp-backend:latest
```

## Database Management

### View Database (Prisma Studio)

```bash
npm run prisma:studio
```

Opens interactive database viewer at http://localhost:5555

### Create Database Migration

```bash
npm run prisma:migrate

# Give migration a name when prompted
```

### Reset Database (⚠️ Production: Be Careful)

```bash
npm run prisma:reset
```

This will:
1. Drop all data
2. Apply all migrations
3. Run seed script

## API Testing

### Using Swagger UI

Visit `http://localhost:3000/api/docs` after starting the server.

### Using cURL

Example registration:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "full_name": "John Doe"
  }'
```

Example login:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

Example authenticated request:

```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Database Connection Error

Check that PostgreSQL is running and the `DATABASE_URL` is correct.

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Prisma Issues

```bash
# Clear Prisma cache
rm -rf node_modules/.prisma
npm install
npm run prisma:generate
```

### NLP Service Unavailable

The ingest endpoints will fail if NLP service is not running. Ensure:
1. NLP service is deployed and running
2. `NLP_SERVICE_URL` points to correct address

## Development Workflow

1. Create feature branch from `main`
2. Run migrations if schema changes
3. Implement feature with tests
4. Run linter: `npm run lint`
5. Run tests: `npm run test`
6. Submit PR for review

## Deployment

### Production Environment Variables

Required environment variables for production:
- `DATABASE_URL` - Production PostgreSQL URL
- `REDIS_URL` - Production Redis URL
- `JWT_SECRET` - Strong random key (min 32 chars)
- `JWT_REFRESH_SECRET` - Strong random key
- `INGEST_API_KEY` - Strong random key
- `NLP_SERVICE_URL` - Production NLP service URL
- `NODE_ENV` - Set to `production`
- `CORS_ORIGIN` - Your frontend URL

### Using Docker for Production

```bash
docker build -t finzapp-backend:1.0.0 .

docker run -d \
  --name finzapp-backend \
  -p 3000:3000 \
  --env-file .env.production \
  finzapp-backend:1.0.0
```

## Monitoring

### Logs

Logs are written to:
- `logs/error.log` - Errors only
- `logs/combined.log` - All logs

### Health Check

```bash
curl http://localhost:3000/api/v1/health
```

## Support

For issues or questions, refer to:
- API Documentation: http://localhost:3000/api/docs
- Prisma Docs: https://www.prisma.io/docs/
- NestJS Docs: https://docs.nestjs.com/
