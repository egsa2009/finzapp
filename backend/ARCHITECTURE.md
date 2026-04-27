# FinzApp Backend Architecture

## Overview

FinzApp Backend is a NestJS-based REST API for managing personal finances. It handles user authentication, transaction management, categorization, reporting, and integration with an NLP service for automatic SMS/Push parsing.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Clients                               │
│         (PWA, Companion App, Mobile, Web)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  NestJS API Layer                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Controllers (HTTP Routing)                            │ │
│  │  - AuthController, UsersController, TransController    │ │
│  │  - CategoriesController, ReportsController, etc.       │ │
│  └────────────────────────────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  Services & Business Logic                             │ │
│  │  - AuthService, UsersService, TransactionsService      │ │
│  │  - ReportsService, IngestService, RulesService         │ │
│  └────────────────────────────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  Repository Layer (Data Access)                        │ │
│  │  - TransactionsRepository                              │ │
│  │  - Prisma ORM (abstraction layer)                       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼─────┐ ┌──────▼──────┐ ┌────▼─────────┐
│ PostgreSQL  │ │  Redis      │ │ NLP Service  │
│  Database   │ │  (Cache)    │ │  (Python)    │
└─────────────┘ └─────────────┘ └──────────────┘
```

## Module Structure

### 1. **Auth Module** (`src/auth/`)
Handles user authentication and token management.

**Components:**
- `AuthService` - Registration, login, token generation/refresh, logout
- `AuthController` - HTTP endpoints for auth operations
- `JwtStrategy` - Validates JWT tokens
- `RefreshJwtStrategy` - Validates refresh tokens
- `JwtAuthGuard` - Protects routes requiring authentication

**Key Features:**
- User registration with password hashing (bcrypt, 12 rounds)
- JWT access tokens (15m expiry)
- Refresh tokens (30d expiry) stored in database
- Token revocation on logout
- Automatic user creation during registration

### 2. **Users Module** (`src/users/`)
Manages user profiles and settings.

**Components:**
- `UsersService` - Profile management
- `UsersController` - User endpoints

**Key Features:**
- Get user profile (email, name, phone, pay_day, monthly_budget)
- Update profile information
- Pay day configuration (1-31, for billing period)
- Monthly budget setting

### 3. **Transactions Module** (`src/transactions/`)
Core module for transaction management.

**Components:**
- `TransactionsService` - Business logic
- `TransactionsRepository` - Data access layer
- `TransactionsController` - HTTP endpoints

**Key Features:**
- Create manual transactions
- List transactions with pagination
- Filter by category and type (INCOME/EXPENSE)
- Update/confirm transaction classification
- Delete transactions (soft delete)
- Period-based retrieval (respects pay_day)
- Integration with NLP for automatic parsing

**Period Logic:**
```
If today >= pay_day:
  Period starts: current_month, pay_day
  Period ends: next_month, pay_day-1

If today < pay_day:
  Period starts: previous_month, pay_day
  Period ends: current_month, pay_day-1
```

### 4. **Categories Module** (`src/categories/`)
Manages transaction categories.

**Components:**
- `CategoriesService` - Category management
- `CategoriesController` - Category endpoints

**System Categories:**
1. Hogar (Home) - #FF6B6B
2. Transporte (Transport) - #4ECDC4
3. Bienestar (Wellness) - #FFD93D
4. Deudas (Debt) - #95E1D3
5. Ahorro (Savings) - #F38181
6. Generosidad (Charity) - #AA96DA
7. Otros (Other) - #FCBAD3

**Key Features:**
- System categories (read-only, global)
- Custom categories (user-specific)
- Category seeding on initialization
- Icon and color customization

### 5. **Reports Module** (`src/reports/`)
Financial analytics and insights.

**Components:**
- `ReportsService` - Report generation
- `ReportsController` - Report endpoints

**Reports:**

1. **Summary** (`GET /reports/summary`)
   - Total income for period
   - Total expenses for period
   - Net balance
   - Budget percentage consumed
   - Projected expenses to period end
   - Remaining budget

2. **Categories** (`GET /reports/categories`)
   - Spending by category
   - Percentage of total
   - Month-over-month comparison
   - Trend calculation

3. **Ants** (`GET /reports/ants`) - Small spending habits
   - Transactions < COP 30,000
   - Grouped by merchant/category
   - Minimum 3 occurrences
   - Annual projection
   - Actionable recommendations

### 6. **Ingest Module** (`src/ingest/`)
Handles SMS and push notification ingestion.

**Components:**
- `IngestService` - Parsing and classification
- `IngestController` - Ingest endpoints

**Endpoints:**
- `POST /ingest/sms` - SMS notification ingestion
- `POST /ingest/push` - Push notification ingestion

**Flow:**
1. Receive raw text (SMS/Push)
2. Call NLP service for parsing (amount, merchant, type)
3. Find matching classification rules (regex patterns)
4. Auto-classify if rule found
5. Create transaction with confirmed status
6. Return transaction with confirmation status

**Headers Required:**
- `X-API-Key` - API key for authentication
- `X-User-ID` - User ID

### 7. **Rules Module** (`src/rules/`)
User-defined classification rules.

**Components:**
- `RulesService` - Rule management
- `RulesController` - Rule endpoints

**Key Features:**
- Create regex-based patterns
- Priority-based matching (higher priority first)
- Enable/disable rules
- Update rules
- Delete rules
- Applied to SMS/Push during ingestion

**Example Rule:**
```json
{
  "pattern": "STARBUCKS|CAFE",
  "category_id": "cafe-category-id",
  "priority": 100
}
```

### 8. **Budgets Module** (`src/budgets/`)
Category-based monthly budgets.

**Components:**
- `BudgetsService` - Budget management
- `BudgetsController` - Budget endpoints

**Key Features:**
- Set budget limits per category per month
- Retrieve budgets by month
- Update/delete budgets
- Used by summary report for percentage calculation

### 9. **Prisma Module** (`src/prisma/`)
Database abstraction and connection management.

**Components:**
- `PrismaService` - ORM client initialization
- `PrismaModule` - Global module export

**Features:**
- Global singleton instance
- Automatic connection/disconnection
- Lifecycle hooks (onModuleInit, onModuleDestroy)

### 10. **Common Module** (`src/common/`)
Shared utilities and middleware.

**Components:**
- `GlobalExceptionFilter` - Unified error handling
- `LoggingInterceptor` - Request/response logging
- `CurrentUserDecorator` - Extract user from request

## Database Schema

### Core Entities

```sql
User
├── id (UUID, PK)
├── email (unique)
├── password_hash (bcrypt)
├── full_name
├── phone
├── pay_day (1-31)
├── monthly_budget (DECIMAL)
├── created_at
├── updated_at
└── deleted_at (soft delete)

Transaction
├── id (UUID, PK)
├── user_id (FK)
├── category_id (FK, nullable)
├── amount (DECIMAL)
├── currency (default: COP)
├── description
├── transaction_type (INCOME|EXPENSE)
├── transaction_source (SMS|PUSH|MANUAL)
├── merchant
├── transaction_at
├── raw_text
├── confirmed (boolean)
├── created_at
├── updated_at
└── deleted_at (soft delete)

Category
├── id (UUID, PK)
├── user_id (FK, nullable for system categories)
├── name
├── icon
├── color
├── is_system (boolean)
├── created_at
└── updated_at

ClassificationRule
├── id (UUID, PK)
├── user_id (FK)
├── category_id (FK)
├── pattern (regex)
├── priority (int)
├── is_active (boolean)
├── created_at
└── updated_at

RefreshToken
├── id (UUID, PK)
├── user_id (FK)
├── token_hash
├── expires_at
├── created_at
└── revoked_at (soft delete)

Budget
├── id (UUID, PK)
├── user_id (FK)
├── category_id (FK)
├── month (date)
├── limit_amount (DECIMAL)
├── created_at
└── updated_at

AuditLog
├── id (UUID, PK)
├── user_id (FK)
├── action
├── resource_type
├── resource_id
├── details (JSON)
└── created_at
```

## Request/Response Flow

### Authentication Flow
```
1. User POSTs /auth/register or /auth/login
2. Service hashes password / validates credentials
3. Service generates access_token + refresh_token
4. Service stores refresh_token hash in DB
5. Response includes both tokens
6. Client stores tokens (access in memory, refresh in secure cookie)
7. Subsequent requests include Authorization: Bearer <access_token>
8. JwtAuthGuard validates token and extracts user
9. Controller receives request with req.user populated
```

### SMS Ingest Flow
```
1. Companion app captures SMS text
2. POSTs to /ingest/sms with raw_text, sender, received_at
3. IngestService calls NLP service: POST /parse
4. NLP returns { amount, merchant, type, transaction_at }
5. IngestService searches ClassificationRules by priority
6. First matching rule's category is assigned
7. Transaction created with confirmed=true if rule matched
8. If no rule, confirmed=false and awaits user confirmation
9. When user confirms, PATCH /transactions/:id with category
10. Service sends feedback to NLP service
```

## Security Measures

1. **Password Hashing** - bcrypt with 12 rounds
2. **JWT Tokens** - Signed with strong secrets
3. **Token Storage** - Refresh tokens hashed before storage
4. **Token Expiration** - Access: 15m, Refresh: 30d
5. **Token Revocation** - Logout revokes refresh token
6. **API Key Validation** - Ingest endpoints require X-API-Key
7. **CORS** - Restricted to configured origin
8. **Helmet** - Security headers
9. **Rate Limiting** - 100 req/min per IP
10. **Soft Deletes** - No permanent data loss without audit trail

## Error Handling

All endpoints return standardized error responses:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "BadRequest",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```

## Logging

Using Winston logger with:
- Console output (development)
- File logging (logs/error.log, logs/combined.log)
- JSON format for production
- Request/response logging via LoggingInterceptor

## NLP Service Integration

### Expected NLP Service Response

```json
{
  "amount": 25000,
  "merchant": "STARBUCKS BOGOTA",
  "type": "expense",
  "transaction_at": "2024-01-15T10:30:00Z"
}
```

### Feedback Endpoint (Used for Training)

```
POST /feedback
{
  "raw_text": "COMPRA STARBUCKS...",
  "category": "category-id",
  "user_id": "user-id"
}
```

## Performance Considerations

1. **Database Indexes**
   - user_id (all tables)
   - category_id (transactions)
   - transaction_at (transactions)
   - is_active (rules)
   - period calculations optimized with date filtering

2. **Pagination** - 20 items per page default

3. **Soft Deletes** - Included in all filtering logic

4. **Caching** - Redis available for future implementation

## Future Enhancements

1. Add caching layer (Redis) for frequently accessed data
2. Implement WebSocket for real-time transaction updates
3. Add recurring transactions
4. Support for account/institution linking
5. Machine learning for spending predictions
6. Multi-currency support
7. Expense sharing features
8. Advanced analytics and insights
