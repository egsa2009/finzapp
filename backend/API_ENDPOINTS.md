# FinzApp API Endpoints Reference

**Base URL:** `http://localhost:3000/api/v1`

**Documentation:** `http://localhost:3000/api/docs` (Swagger UI)

## Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe"
}

Response: 201
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

### Refresh Access Token
```
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}

Response: 200
{
  "access_token": "eyJhbGc..."
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "refresh_token": "eyJhbGc..."
}

Response: 200
{
  "message": "Successfully logged out"
}
```

## Users Endpoints

### Get User Profile
```
GET /users/me
Authorization: Bearer {access_token}

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+573001234567",
  "pay_day": 15,
  "monthly_budget": "5000000",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Update User Profile
```
PATCH /users/me
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "phone": "+573001234567",
  "pay_day": 20,
  "monthly_budget": "6000000"
}

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Jane Doe",
  "phone": "+573001234567",
  "pay_day": 20,
  "monthly_budget": "6000000",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

## Categories Endpoints

### List All Categories
```
GET /categories
Authorization: Bearer {access_token}

Response: 200
[
  {
    "id": "uuid",
    "user_id": null,
    "name": "Hogar",
    "icon": "home",
    "color": "#FF6B6B",
    "is_system": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Comida Rápida",
    "icon": "utensils",
    "color": "#FF6B6B",
    "is_system": false,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

### Create Custom Category
```
POST /categories
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Comida Rápida",
  "icon": "utensils",
  "color": "#FF6B6B"
}

Response: 201
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Comida Rápida",
  "icon": "utensils",
  "color": "#FF6B6B",
  "is_system": false,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

## Transactions Endpoints

### List Transactions (Current Period)
```
GET /transactions?page=1&limit=20&categoryId=uuid&type=EXPENSE
Authorization: Bearer {access_token}

Response: 200
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "category_id": "uuid",
      "amount": "25000",
      "currency": "COP",
      "description": "Café",
      "transaction_type": "EXPENSE",
      "transaction_source": "SMS",
      "merchant": "STARBUCKS BOGOTA",
      "transaction_at": "2024-01-15T10:30:00Z",
      "raw_text": "COMPRA EN STARBUCKS...",
      "confirmed": false,
      "created_at": "2024-01-15T10:35:00Z",
      "updated_at": "2024-01-15T10:35:00Z",
      "category": {
        "id": "uuid",
        "name": "Bienestar"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Create Manual Transaction
```
POST /transactions
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "amount": 50000,
  "description": "Almuerzo",
  "transaction_type": "EXPENSE",
  "category_id": "uuid",
  "merchant": "RESTAURANTE XYZ",
  "transaction_at": "2024-01-15T12:00:00Z"
}

Response: 201
{
  "id": "uuid",
  "user_id": "uuid",
  "category_id": "uuid",
  "amount": "50000",
  "currency": "COP",
  "description": "Almuerzo",
  "transaction_type": "EXPENSE",
  "transaction_source": "MANUAL",
  "merchant": "RESTAURANTE XYZ",
  "transaction_at": "2024-01-15T12:00:00Z",
  "raw_text": null,
  "confirmed": true,
  "created_at": "2024-01-15T12:05:00Z",
  "updated_at": "2024-01-15T12:05:00Z",
  "category": {
    "id": "uuid",
    "name": "Hogar"
  }
}
```

### Update Transaction
```
PATCH /transactions/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "category_id": "uuid",
  "description": "Café actualizado",
  "confirmed": true
}

Response: 200
{
  "id": "uuid",
  "user_id": "uuid",
  "category_id": "uuid",
  "amount": "25000",
  "currency": "COP",
  "description": "Café actualizado",
  "transaction_type": "EXPENSE",
  "transaction_source": "SMS",
  "merchant": "STARBUCKS BOGOTA",
  "transaction_at": "2024-01-15T10:30:00Z",
  "raw_text": "COMPRA EN STARBUCKS...",
  "confirmed": true,
  "created_at": "2024-01-15T10:35:00Z",
  "updated_at": "2024-01-15T12:10:00Z",
  "category": {
    "id": "uuid",
    "name": "Bienestar"
  }
}
```

### Delete Transaction
```
DELETE /transactions/{id}
Authorization: Bearer {access_token}

Response: 200
{
  "id": "uuid",
  "deleted_at": "2024-01-15T12:15:00Z"
}
```

## Reports Endpoints

### Get Summary Report
```
GET /reports/summary
Authorization: Bearer {access_token}

Response: 200
{
  "period": {
    "start": "2024-01-15T00:00:00Z",
    "end": "2024-02-14T23:59:59Z"
  },
  "totalIncome": 2000000,
  "totalExpenses": 1250000,
  "netBalance": 750000,
  "budgetLimit": 1500000,
  "budgetPercentage": 83,
  "projectedExpenses": 1500000,
  "remainingBudget": 250000
}
```

### Get Categories Report
```
GET /reports/categories
Authorization: Bearer {access_token}

Response: 200
[
  {
    "categoryId": "uuid",
    "categoryName": "Hogar",
    "categoryIcon": "home",
    "categoryColor": "#FF6B6B",
    "amount": 500000,
    "percentage": 40,
    "previousAmount": 450000,
    "trend": 11.11
  },
  {
    "categoryId": "uuid",
    "categoryName": "Transporte",
    "categoryIcon": "car",
    "categoryColor": "#4ECDC4",
    "amount": 300000,
    "percentage": 24,
    "previousAmount": 280000,
    "trend": 7.14
  }
]
```

### Get Ants Report (Small Spending Habits)
```
GET /reports/ants
Authorization: Bearer {access_token}

Response: 200
{
  "count": 2,
  "ants": [
    {
      "key": "STARBUCKS",
      "merchant": "STARBUCKS",
      "category": "Bienestar",
      "occurrences": 5,
      "totalAmount": 125000,
      "averageAmount": 25000,
      "projectedAnnual": 1500000,
      "recommendation": "You spent COP 125000 in 5 small transactions. Projected annual: COP 1500000. Consider cutting this habit."
    }
  ],
  "totalProjectedAnnual": 1500000
}
```

## Rules Endpoints

### List Classification Rules
```
GET /rules
Authorization: Bearer {access_token}

Response: 200
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "pattern": "STARBUCKS|CAFE",
    "priority": 100,
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "category": {
      "id": "uuid",
      "name": "Bienestar"
    }
  }
]
```

### Create Rule
```
POST /rules
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "pattern": "STARBUCKS|CAFE",
  "category_id": "uuid",
  "priority": 100
}

Response: 201
{
  "id": "uuid",
  "user_id": "uuid",
  "category_id": "uuid",
  "pattern": "STARBUCKS|CAFE",
  "priority": 100,
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z",
  "category": {
    "id": "uuid",
    "name": "Bienestar"
  }
}
```

### Update Rule
```
PATCH /rules/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "pattern": "STARBUCKS|CAFE|EXPRESSO",
  "priority": 110
}

Response: 200
{
  "id": "uuid",
  "user_id": "uuid",
  "category_id": "uuid",
  "pattern": "STARBUCKS|CAFE|EXPRESSO",
  "priority": 110,
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z",
  "category": {
    "id": "uuid",
    "name": "Bienestar"
  }
}
```

### Delete Rule
```
DELETE /rules/{id}
Authorization: Bearer {access_token}

Response: 200
{
  "id": "uuid"
}
```

### Toggle Rule Status
```
PATCH /rules/{id}/toggle
Authorization: Bearer {access_token}

Response: 200
{
  "id": "uuid",
  "user_id": "uuid",
  "category_id": "uuid",
  "pattern": "STARBUCKS|CAFE",
  "priority": 100,
  "is_active": false,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T11:05:00Z",
  "category": {
    "id": "uuid",
    "name": "Bienestar"
  }
}
```

## Budgets Endpoints

### List All Budgets
```
GET /budgets
Authorization: Bearer {access_token}

Response: 200
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "month": "2024-01-01T00:00:00Z",
    "limit_amount": "500000",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "category": {
      "id": "uuid",
      "name": "Hogar"
    }
  }
]
```

### Get Budgets by Month
```
GET /budgets/by-month?month=2024-01-01
Authorization: Bearer {access_token}

Response: 200
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "month": "2024-01-01T00:00:00Z",
    "limit_amount": "500000",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "category": {
      "id": "uuid",
      "name": "Hogar"
    }
  }
]
```

### Create Budget
```
POST /budgets
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "category_id": "uuid",
  "limit_amount": "500000",
  "month": "2024-01-01"
}

Response: 201
{
  "id": "uuid",
  "user_id": "uuid",
  "category_id": "uuid",
  "month": "2024-01-01T00:00:00Z",
  "limit_amount": "500000",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z",
  "category": {
    "id": "uuid",
    "name": "Hogar"
  }
}
```

### Update Budget
```
PATCH /budgets/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "limit_amount": "600000"
}

Response: 200
{
  "id": "uuid",
  "user_id": "uuid",
  "category_id": "uuid",
  "month": "2024-01-01T00:00:00Z",
  "limit_amount": "600000",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z",
  "category": {
    "id": "uuid",
    "name": "Hogar"
  }
}
```

### Delete Budget
```
DELETE /budgets/{id}
Authorization: Bearer {access_token}

Response: 200
{
  "id": "uuid"
}
```

## Ingest Endpoints

### Ingest SMS
```
POST /ingest/sms
X-API-Key: {INGEST_API_KEY}
X-User-ID: {user_id}
Content-Type: application/json

{
  "raw_text": "COMPRA EN STARBUCKS POR COP 25000. SALDO: COP 1000000",
  "sender": "+573001234567",
  "received_at": "2024-01-15T10:30:00Z"
}

Response: 200
{
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "amount": "25000",
    "currency": "COP",
    "description": "STARBUCKS",
    "transaction_type": "EXPENSE",
    "transaction_source": "SMS",
    "merchant": "STARBUCKS",
    "transaction_at": "2024-01-15T10:30:00Z",
    "raw_text": "COMPRA EN STARBUCKS POR COP 25000...",
    "confirmed": true,
    "created_at": "2024-01-15T10:35:00Z",
    "updated_at": "2024-01-15T10:35:00Z",
    "category": {
      "id": "uuid",
      "name": "Bienestar"
    }
  },
  "confirmed": true
}
```

### Ingest Push Notification
```
POST /ingest/push
X-API-Key: {INGEST_API_KEY}
X-User-ID: {user_id}
Content-Type: application/json

{
  "raw_text": "COMPRA EN UBER EATS POR COP 45000",
  "app_package": "com.ubereats",
  "received_at": "2024-01-15T12:00:00Z"
}

Response: 200
{
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": null,
    "amount": "45000",
    "currency": "COP",
    "description": "UBER EATS",
    "transaction_type": "EXPENSE",
    "transaction_source": "PUSH",
    "merchant": "UBER EATS",
    "transaction_at": "2024-01-15T12:00:00Z",
    "raw_text": "COMPRA EN UBER EATS POR COP 45000",
    "confirmed": false,
    "created_at": "2024-01-15T12:05:00Z",
    "updated_at": "2024-01-15T12:05:00Z",
    "category": null
  },
  "confirmed": false
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "BadRequest",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "path": "/api/v1/transactions"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "path": "/api/v1/users/me"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "NotFoundException",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "path": "/api/v1/users/me"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "InternalServerError",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```

## Rate Limiting

- **Limit:** 100 requests per minute per IP
- **Headers:**
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 99`
  - `X-RateLimit-Reset: 1234567890`

## Pagination

Default: 20 items per page

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```
