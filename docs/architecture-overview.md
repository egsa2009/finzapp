# FinzApp - Arquitectura General

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Autores:** Equipo FinzApp  
**Última actualización:** 2026-04-26

## 1. Visión General

FinzApp es una aplicación de finanzas personales diseñada específicamente para usuarios colombianos. Captura automáticamente transacciones desde SMS y notificaciones push de entidades bancarias (Bancolombia, Davivienda, Nequi, Daviplata, etc.) y proporciona análisis financiero inteligente.

La arquitectura sigue principios de **Clean Architecture** y **Modular Monolith**, separando responsabilidades en capas independientes y microservicios especializados.

## 2. Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CAPA DE PRESENTACIÓN                        │
├─────────────────────────────┬───────────────────────────────────────┤
│  Frontend PWA (React 18)     │  Companion Apps (iOS/Android)        │
│  - React + Vite             │  - iOS: Swift + SwiftUI              │
│  - TypeScript + TailwindCSS  │  - Android: Kotlin + Jetpack         │
│  - TanStack Query (datos)    │  - Captura SMS/Push nativa           │
│  - Redux (estado global)     │  - Sincronización en tiempo real      │
└──────────────┬──────────────┴──────────────┬──────────────────────────┘
               │                             │
               │        API Gateway          │
               │    (NestJS Middleware)      │
               ├──────────────────────────────┤
               │
┌──────────────v──────────────────────────────────────────────────────┐
│                    CAPA DE APLICACIÓN (NestJS)                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐    │
│  │  Auth Module    │  │  Transaction Mgmt│  │ Analytics Svc  │    │
│  │  - JWT tokens   │  │  - CRUD Txns     │  │  - Dashboards  │    │
│  │  - Refresh flow │  │  - Categoría     │  │  - Reportes    │    │
│  │  - Sessions     │  │  - Tags/Notes    │  │  - Budgets     │    │
│  └─────────────────┘  └──────────────────┘  └────────────────┘    │
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐    │
│  │  Webhook Svc    │  │  Notification Svc│  │  User Profile  │    │
│  │  - SMS Parser   │  │  - Push alerts   │  │  - Settings    │    │
│  │  - Validate     │  │  - In-app msgs   │  │  - Preferences │    │
│  │  - Normalize    │  │  - Email alerts  │  │  - 2FA         │    │
│  └─────────────────┘  └──────────────────┘  └────────────────┘    │
│                                                                      │
└──────────────┬───────────────────────────────────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───v────┐ ┌──v────┐ ┌───v─────────┐
│PostgreSQL  │ Redis  │ NLP Service │
│- Transac.  │- Cache │ (Python)    │
│- Users     │- Queue │- spaCy      │
│- Settings  │- Sesns │- Regex      │
└───────┘ └─────┘ └───────────────┘
```

## 3. Descripción de Capas

### 3.1 Capa de Presentación (Frontend)

**PWA (Progressive Web App)**
- **Framework:** React 18 con Vite para compilación rápida
- **Lenguaje:** TypeScript con strict mode
- **Styling:** TailwindCSS para diseño responsive
- **Estado:** Redux para estado global (transacciones, usuario, UI)
- **Peticiones:** TanStack Query v4 para sincronización con servidor
- **Persistencia local:** IndexedDB para offline-first capability
- **Características PWA:** Service Workers, manifest.json, soporte offline

**Companion Nativa (Captura de SMS/Push)**
- **iOS:** Swift + SwiftUI, acceso nativo a notificaciones con userNotificationCenter
- **Android:** Kotlin + Jetpack Compose, BroadcastReceiver para SMS, Firebase Cloud Messaging

### 3.2 Capa de API Gateway

**NestJS Middleware**
- Enrutamiento de peticiones HTTP/HTTPS
- Validación de JWT (access token y refresh token)
- Rate limiting y CORS
- Compresión de respuestas
- Logging y monitoreo de tráfico

### 3.3 Capa de Aplicación (NestJS Backend)

**Módulos principales:**

1. **Auth Module**
   - Autenticación con JWT
   - Access token: válido 24 horas
   - Refresh token: válido 30 días
   - 2FA opcional (TOTP/SMS)
   - Logout y invalidación de sesiones

2. **Transaction Management**
   - CRUD de transacciones
   - Categorización automática
   - Tags y notas de usuario
   - Filtros y búsqueda
   - Sincronización con NLP Service

3. **Webhook Service**
   - Receptor de SMS desde companion apps
   - Parsing y validación de formatos
   - Normalización de datos
   - Encola tareas al NLP Service
   - Deduplicación

4. **NLP Service (Python)**
   - Parser de transacciones bancarias
   - Extrae: monto, beneficiario, tipo (débito/crédito), fecha
   - Modelos: spaCy + regex patterns específicos para bancos colombianos
   - Feedback del usuario para mejorar precisión

5. **Notification Service**
   - Push notifications (Firebase Cloud Messaging)
   - Email alerts
   - In-app notifications
   - Preferencias por usuario

6. **Analytics Service**
   - Dashboards de gastos/ingresos
   - Reportes mensuales/anuales
   - Detección de anomalías
   - Budget management
   - Proyecciones

7. **User Profile Module**
   - Gestión de perfil
   - Configuración de preferencias
   - Autenticación 2FA
   - Datos de contacto

### 3.4 Capa de Datos

**PostgreSQL**
- Base de datos relacional
- Tablas: users, transactions, categories, budgets, notifications, audit_log
- Índices en campos frecuentemente consultados
- Backups automáticos

**Redis**
- Cache distribuido
- Almacén de sesiones
- Queue para procesamiento asincrónico (Celery/Bull)
- Rate limiting

**NLP Service (Python)**
- Modelos de spaCy pre-entrenados
- Diccionarios de patrones (regex) para bancos colombianos
- Archivo de configuración para mappeo de entidades

## 4. Flujos de Datos Principales

### 4.1 Flujo de Captura de Transacción

```
1. Usuario recibe SMS/Push del banco
   ↓
2. Companion app (iOS/Android) recibe notificación
   ↓
3. App parsea el SMS/Push y envía a Backend vía API
   ↓
4. Webhook Service valida y normaliza
   ↓
5. Encola tarea en Redis Queue
   ↓
6. NLP Service procesa (extrae monto, beneficiario, etc)
   ↓
7. Resultado se guarda en PostgreSQL
   ↓
8. PWA sincroniza automáticamente (TanStack Query)
   ↓
9. Usuario ve transacción en dashboard (tiempo real con WebSocket)
```

### 4.2 Flujo de Autenticación

```
1. Usuario ingresa credenciales
   ↓
2. Backend valida contra PostgreSQL
   ↓
3. Genera access token (24h) + refresh token (30d)
   ↓
4. Frontend almacena tokens (localStorage + cookie httpOnly)
   ↓
5. Cada petición incluye Authorization: Bearer {access_token}
   ↓
6. Middleware valida token antes de procesar
   ↓
7. Si access_token expira, refresh token genera uno nuevo
```

### 4.3 Flujo de Analytics

```
1. Backend calcula agregaciones bajo demanda
   ↓
2. Resultados se cachean en Redis por usuario
   ↓
3. PWA solicita datos mediante TanStack Query
   ↓
4. Dashboard renderiza gráficos (Chart.js o Recharts)
   ↓
5. Exportar a PDF/CSV disponible
```

## 5. Decisiones Arquitectónicas Clave

### 5.1 Clean Architecture + Modular Monolith

**Por qué:**
- Separación clara de responsabilidades
- Fácil de testear
- Escalable a microservicios futuros sin refactorizar toda la app
- Cada módulo puede evolucionar independientemente

**Estructura:**
```
src/
├── domain/          → Lógica de negocio (entidades, DTOs)
├── application/     → Casos de uso (services)
├── infrastructure/  → BD, APIs externas, I/O
├── presentation/    → Controllers, validadores
└── common/          → Helpers, constantes, guards
```

### 5.2 NLP Service Separado (Python)

**Por qué:**
- Python es mejor para NLP con spaCy, scikit-learn
- Desacopla la complejidad NLP del backend principal
- Permite escalado independiente
- Facilita entrenamiento con feedback del usuario

**Comunicación:**
- Message queue (Redis) entre NestJS y Python
- Celery o APScheduler para tareas asincrónicas

### 5.3 Companion Apps Nativas

**Por qué:**
- **iOS:** Apple no permite PWA acceso a SMS/push de forma confiable; Shortcuts app (iOS 12+) + Apple Automation son workaround oficial
- **Android:** BroadcastReceiver obtiene SMS en tiempo real; PWA no tiene acceso
- Menor latencia en captura
- Mejor UX notificación
- Soporte para background processing

### 5.4 JWT con Dual Token

**Por qué:**
- Access token corta vida (24h) reduce riesgo si se expone
- Refresh token larga vida (30d) mejora UX sin requerer re-login
- Refresh token se puede revocar serverside (blacklist en Redis)
- Cumple OWASP best practices

## 6. Patrones de Diseño Utilizados

| Patrón | Ubicación | Propósito |
|--------|-----------|----------|
| **Dependency Injection** | NestJS providers | Inyección de dependencias y testabilidad |
| **Repository Pattern** | infrastructure/ | Abstracción de acceso a datos |
| **Service Layer** | application/ | Lógica de negocio centralizada |
| **DTO Pattern** | domain/ | Validación y serialización de datos |
| **Adapter Pattern** | infrastructure/ | Conexión con APIs externas |
| **Strategy Pattern** | NLP Service | Diferentes parsers por banco |
| **Observer Pattern** | Redux/Events | Notificaciones de cambios de estado |
| **Queue Pattern** | Redis Bull | Procesamiento asincrónico |

## 7. Escalabilidad y Rendimiento

### 7.1 Estrategia de Escalado

**Horizontal:**
- NestJS: stateless, soporta load balancing
- PostgreSQL: replicación read-only para reportes
- Redis: cluster mode para alta disponibilidad
- NLP Service: múltiples workers con Celery

**Vertical:**
- Índices en PostgreSQL para queries complejas
- Redis cache en capas (user → global)
- Compresión de respuestas HTTP

### 7.2 Optimizaciones

- **Frontend:** Code splitting, lazy loading, tree shaking con Vite
- **Backend:** Connection pooling (pgBouncer), query batching
- **NLP:** Caché de resultados (Redis), modelos compilados
- **BD:** Índices en user_id, transaction_date, category

## 8. Seguridad

- **Autenticación:** JWT con signing key seguro
- **Autorización:** Role-based access control (RBAC)
- **Encriptación:** HTTPS obligatorio, datos sensibles encriptados en BD
- **Validación:** Input validation en todos los endpoints
- **Rate limiting:** Por IP y por usuario autenticado
- **CORS:** Configurado restrictivamente
- **XSS:** Content Security Policy (CSP) headers
- **CSRF:** SameSite cookies, CSRF tokens en formularios
- **SQL Injection:** Prepared statements + ORM (TypeORM)
- **Logging:** Auditoría de cambios críticos

## 9. DevOps y Deployment

### 9.1 Environments

- **Development:** Local con Docker Compose
- **Staging:** Refleja producción, pruebas previas
- **Production:** Google Cloud / AWS con auto-scaling

### 9.2 CI/CD

- GitHub Actions / GitLab CI
- Tests automáticos (unit, integration, E2E)
- Code coverage mínimo 80%
- Linting y format checks (ESLint, Prettier)
- Seguridad: SAST con SonarQube

### 9.3 Monitoreo

- Logs: Winston (NestJS) + ELK Stack
- Métricas: Prometheus + Grafana
- Error tracking: Sentry
- APM: New Relic o Datadog

## 10. Próximos Pasos y Roadmap

### Corto Plazo (3 meses)
- [ ] Integración con 5 bancos adicionales
- [ ] Exportación a PDF/Excel
- [ ] Categorización automática IA
- [ ] Notificaciones inteligentes

### Mediano Plazo (6-12 meses)
- [ ] Microsegmentación de budgets
- [ ] Predicción de gastos (ML)
- [ ] Integración con fintech (inversiones, créditos)
- [ ] Mobile app nativa con Expo/React Native
- [ ] API pública para partners

### Largo Plazo (1-2 años)
- [ ] Asesoría financiera automática
- [ ] Blockchain para transacciones (POC)
- [ ] Open Banking con estándares PSD2/FIDO
- [ ] Marketplace de servicios financieros

---

**Referencias:**
- Clean Architecture: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- NestJS Docs: https://docs.nestjs.com
- React Best Practices: https://react.dev
- PostgreSQL Performance: https://www.postgresql.org/docs/current/performance.html
