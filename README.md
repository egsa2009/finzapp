# FinzApp - Finanzas Personales Inteligentes

[![CI/CD Pipeline](https://github.com/your-org/finzapp/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/finzapp/actions)
[![Coverage](https://codecov.io/gh/your-org/finzapp/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/finzapp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Descripción

**FinzApp** es una aplicación web progresiva (PWA) de finanzas personales colombiana que revoluciona la forma de gestionar dinero mediante **parseo automático e inteligente de SMS y push bancarios**.

### Problema

Los usuarios colombianos reciben decenas de SMS bancarios mensuales pero deben registrar manualmente cada transacción en apps de presupuesto. Es tedioso, propenso a errores y poco escalable.

### Solución

FinzApp captura automáticamente SMS/push bancarios usando un **motor NLP propietario** que extrae:
- Monto (con normalización de formato colombiano)
- Comercio/destinatario
- Tipo de transacción (compra, transferencia, retiro, etc.)
- Fecha y hora exactas

**Diferencial**: Funciona sin API bancaria (todos los bancos soportados), tiene altísima precisión (>95% con transacciones comunes) y actualiza categorías en tiempo real.

## Stack Tecnológico

### Backend
- **Node.js 20** + **NestJS** - Framework robusto con TypeScript
- **PostgreSQL 16** - Base de datos relacional
- **Redis 7** - Cache y sesiones
- **Prisma ORM** - Migrations y queries type-safe

### Frontend
- **React 18** + **TypeScript** - UI moderna
- **Vite** - Build tool ultrarrápido
- **TailwindCSS** - Styling
- **Tanstack Query** - State management para datos
- **Zustand** - Global state
- **PWA** - Funciona offline y instalable

### NLP Service
- **Python 3.12** - Lenguaje de datos
- **FastAPI** - API de alto rendimiento
- **Regex + NLP heurísticos** - Parser robusto
- **dateutil** - Parseo de fechas colombianas

### DevOps
- **Docker 24** + **Docker Compose** - Containerización
- **GitHub Actions** - CI/CD automático
- **PostgreSQL + Redis** - Persistencia en Docker

## Arquitectura

```
finzapp/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # JWT, roles, permisos
│   │   ├── transactions/      # Módulo de transacciones
│   │   ├── categories/        # Categorías custom
│   │   ├── reports/           # Reportes y análisis
│   │   ├── ingest/            # Ingesta de SMS/push
│   │   └── shared/            # Utilities, guards, filters
│   ├── prisma/                # Schemas y migrations
│   └── Dockerfile
│
├── frontend/                   # React PWA
│   ├── src/
│   │   ├── pages/             # Dashboard, Movimientos, Reportes
│   │   ├── components/        # UI reutilizables
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand stores
│   │   ├── services/          # API clients
│   │   └── utils/             # Helpers
│   ├── public/                # Manifest, iconos PWA
│   └── Dockerfile
│
├── nlp-service/               # Python FastAPI
│   ├── parser/
│   │   ├── sms_parser.py      # Parser de SMS
│   │   ├── push_parser.py     # Parser de push
│   │   ├── normalizer.py      # Normalización de datos
│   │   └── __init__.py
│   ├── tests/
│   │   └── test_sms_parser.py # Suite de pruebas
│   ├── main.py                # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD
│
├── docker-compose.yml         # Compose producción
├── docker-compose.dev.yml     # Compose desarrollo
├── .env.example               # Variables de entorno
├── Makefile                   # Utilidades de desarrollo
└── README.md                  # Este archivo
```

## Quickstart (5 minutos)

### Requisitos previos

- Docker 24+ y Docker Compose
- Node.js 20+ (para desarrollo local)
- Python 3.12+ (para desarrollo del NLP)
- Git

### Levantar la aplicación completa

```bash
# 1. Clonar repositorio
git clone https://github.com/your-org/finzapp.git
cd finzapp

# 2. Crear archivo de entorno
cp .env.example .env

# 3. Levantar servicios (desarrollo)
make dev

# 4. Esperar a que suban (20-30 segundos)
# Frontend:    http://localhost:5173
# API:         http://localhost:3000/api/v1
# NLP Service: http://localhost:8001
# Adminer:     http://localhost:8080

# 5. Ejecutar migraciones y seed
make migrate
make seed

# ¡Listo! Abirir http://localhost:5173 en el navegador
```

### Levantar solo un servicio

```bash
# Backend
docker-compose exec api bash
npm run dev

# Frontend
docker-compose exec frontend bash
npm run dev

# NLP Service
docker-compose exec nlp-service bash
uvicorn main:app --reload

# Base de datos (Adminer)
# http://localhost:8080
```

## Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```bash
# Base de datos
POSTGRES_DB=finzapp
POSTGRES_USER=finzapp_user
POSTGRES_PASSWORD=xxxxx          # CAMBIAR EN PRODUCCIÓN

# Redis
REDIS_PASSWORD=xxxxx             # CAMBIAR EN PRODUCCIÓN

# JWT
JWT_SECRET=xxxxx                 # Mínimo 32 caracteres
JWT_REFRESH_SECRET=xxxxx         # Mínimo 32 caracteres

# API
INGEST_API_KEY=xxxxx             # Key para mobile/webhook

# URLs
NLP_SERVICE_URL=http://nlp-service:8000
VITE_API_URL=http://localhost:3000/api/v1
```

Ver `.env.example` para todas las opciones.

## Desarrollo

### Backend

```bash
# Instalar dependencias
cd backend && npm ci

# Correr en modo desarrollo (hot-reload)
npm run dev

# Ejecutar tests
npm run test
npm run test:coverage

# Ejecutar linter
npm run lint

# Migraciones
npx prisma migrate dev
npx prisma studio  # UI visual de BD
```

### Frontend

```bash
# Instalar dependencias
cd frontend && npm ci

# Correr en modo desarrollo (hot-reload en puerto 5173)
npm run dev

# Ejecutar tests
npm run test
npm run test:coverage

# Ejecutar linter
npm run lint

# Build producción
npm run build
```

### NLP Service

```bash
# Instalar dependencias
cd nlp-service && pip install -r requirements.txt

# Correr en modo desarrollo
uvicorn main:app --reload

# Ejecutar tests
pytest -v --cov=parser

# Prueba manual
curl -X POST http://localhost:8000/parse \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "Bancolombia: Compra en RAPPI por $45.000 el 23/04/2026",
    "sender": "BANCOLOMBIA",
    "source": "sms"
  }'
```

## Makefile - Comandos útiles

```bash
make dev              # Levantar servicios en desarrollo
make prod             # Levantar servicios en producción
make down             # Detener servicios
make logs             # Ver logs en vivo
make test             # Ejecutar todos los tests
make migrate          # Ejecutar migraciones
make seed             # Seed de datos iniciales
make nlp-test         # Tests solo del NLP
make lint             # Linters de todos los servicios
make fresh            # Limpia todo y levanta desde cero
make help             # Ver todos los comandos
```

## Testing

### Suite de Tests

FinzApp tiene cobertura completa:

```bash
# Todos los tests
make test

# Backend
make backend-test          # Unit tests
make backend-test-watch    # Watch mode
make backend-test-coverage # Con reporte

# Frontend
make frontend-test
make frontend-test-coverage

# NLP
make nlp-test
make nlp-test-coverage
```

### NLP Parser - Ejemplos

```python
from parser.sms_parser import SMSParser

parser = SMSParser()

# SMS Bancolombia
result = parser.parse(
    "Bancolombia: Compra en RAPPI*RESTAURANTE por $45.000 el 23/04/2026",
    "BANCOLOMBIA"
)
assert result.amount == 45000.0
assert result.merchant == "Rappi Restaurante"
assert result.transaction_type == "expense"
assert result.confidence > 0.95

# SMS Nequi
result = parser.parse(
    "Nequi: Transferiste $50.000 a Juan García. Saldo: $320.000",
    "NEQUI"
)
assert result.transaction_type == "transfer_sent"
```

## Bases de Datos

### PostgreSQL

```bash
# Acceder a la consola psql
make db-shell

# Ver tablas
\dt

# Ver estructura de tabla
\d transactions

# Ejecutar query
SELECT * FROM transactions LIMIT 10;
```

### Redis

```bash
# Acceder a Redis CLI
docker-compose exec redis redis-cli -a <REDIS_PASSWORD>

# Ver todas las keys
keys *

# Ver valor
get <key>
```

## Deploy

### Producción

```bash
# 1. Build imágenes Docker
make prod-build

# 2. Push a Docker Hub (si aplica)
docker push finzapp-api:latest
docker push finzapp-frontend:latest
docker push finzapp-nlp:latest

# 3. En servidor de producción:
docker-compose -f docker-compose.yml pull
docker-compose -f docker-compose.yml up -d
docker-compose -f docker-compose.yml exec api npm run prisma:migrate:prod
```

### GitHub Actions

El archivo `.github/workflows/ci.yml` ejecuta automáticamente:
- Linters (ESLint, Prettier, Pylint)
- Unit tests (Jest, Pytest, Vitest)
- Security scan (npm audit, pip-audit, Snyk)
- Build Docker (en main)
- Integration tests

El pipeline solo hace deploy en rama `main` con push exitoso.

## Roadmap

### Fase 1: MVP (Actual)
- [x] Parseo de SMS/push bancarios
- [x] Dashboard básico con transacciones
- [x] Categorización automática
- [x] Reportes de gastos mensuales
- [x] PWA instalable

### Fase 2: Inteligencia
- [ ] Detección de patrones de gasto
- [ ] Presupuesto y alertas
- [ ] Predicción de flujo de caja
- [ ] ML para detección de fraude
- [ ] Recommendations personalizadas

### Fase 3: Integración
- [ ] API pública para terceros
- [ ] Integración con apps de inversión
- [ ] Sincronización con Sheets/Excel
- [ ] Webhook para automaciones

### Fase 4: Expansión
- [ ] Soporte para otros bancos latinoamericanos
- [ ] App móvil nativa (React Native)
- [ ] Multi-moneda (USD, MXN, CLP, etc.)
- [ ] Marketplace de servicios

## Contribución

Las contribuciones son bienvenidas.

1. Fork el repositorio
2. Crear rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

Por favor asegurar que:
- Código sigue el style guide
- Tests pasan (`make test`)
- Linters passan (`make lint`)
- No hay warnings de seguridad

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## Contacto

- Email: info@finzapp.co
- Twitter: @finzapp_co
- Website: https://finzapp.co

## Acknowledgments

- Bancos colombianos por proporcionar SMS detallados
- Comunidad de código abierto
- Nuestros usuarios beta
