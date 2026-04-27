# ADR-002: Selección del Stack Tecnológico

**Estado:** Aceptado  
**Fecha:** Abril 2026  
**Autores:** Equipo FinzApp  
**Versión:** 1.0

## Contexto

FinzApp necesita un stack tecnológico que:

1. Sea **maintainable** en 5+ años
2. Tenga **comunidad activa** y soporte
3. Permita **desarrollo rápido** (time-to-market)
4. Sea **escalable** desde MVP a millones de usuarios
5. Tenga **talento disponible** en el mercado colombiano
6. No sea **overkill** pero tampoco tenga **limitaciones futuras**

Se evaluaron stacks completos para cada capa:

## Decisión

### Backend: NestJS + PostgreSQL + Redis

**NestJS (TypeScript/Node.js)**

```typescript
// Ventajas concretas para FinzApp:
✓ Arquitectura opinada (Clean Architecture nativa)
✓ Inyección de dependencias integrada
✓ CLI para generar boilerplate consistente
✓ Decoradores potentes (@Module, @Injectable, @Controller)
✓ Integración con TypeORM, GraphQL, WebSockets
✓ Excelente documentación y comunidad
✓ Equipo sabe TypeScript ya
```

**PostgreSQL (Relacional)**

```sql
-- Razones:
✓ ACID compliance (critical para transacciones financieras)
✓ JSON support para datos semi-estructurados (SMS parsed)
✓ Full-text search para transacciones
✓ Scalable (replicación, read replicas)
✓ Open source y estable desde 1996
✓ Hosting barato en GCP/AWS
```

**Redis (Cache + Queue)**

```javascript
// Usos en FinzApp:
✓ Cache de usuario actual (1 segundo de latencia)
✓ Sessions temporales (JWT refresh)
✓ Job queue para NLP processing
✓ Rate limiting por usuario
✓ Pub/Sub para notificaciones en tiempo real
```

### Frontend: React 18 + Vite + TailwindCSS (PWA)

**React 18 (UI Framework)**

```jsx
// Decisión:
✓ Ecosistema maduro (hooks, context, suspense)
✓ Talento abundante en mercado
✓ React 18: concurrent features, automatic batching
✓ TanStack Query para sincronización (replacement para Redux para datos)
✓ Redux para estado global de UI
✓ RoadMap claro hasta 2027+
```

**Vite (Build Tool)**

```javascript
// Vs Webpack/CRA:
✓ 3-5x más rápido en dev server (HMR < 100ms)
✓ Build optimizado con Rollup
✓ Native ESM support
✓ Mejor DX (developer experience)
✓ Menor bundle size
```

**TailwindCSS (Styling)**

```jsx
// Vs Material-UI/Styled-Components:
✓ Utility-first = designs consistentes
✓ ~10KB final CSS (purged)
✓ Dark mode incluido
✓ Responsive by default
✓ No overhead de componentes pesados
```

**PWA (Progressive Web App)**

```json
{
  "manifest.json": {
    "icons": ["192x192", "512x512"],
    "theme_color": "#0066cc",
    "display": "standalone"
  },
  "service-worker.ts": "offline-first, background sync"
}
```

**Razones PWA:**
- No requiere App Store (distribución ágil)
- Instalable en home screen (frente a web)
- Funciona offline (crítico si la red del banco cae)
- Compatible con tanto iOS como Android

### NLP Service: Python (FastAPI + spaCy)

**Python para NLP**

```python
# Razones:
✓ Ecosistema NLP maduro (spaCy, NLTK, scikit-learn)
✓ Modelos pre-entrenados disponibles (es_core_news_md)
✓ Pandas para análisis de patrones
✓ Jupyter para experimentación rápida
✓ TensorFlow/PyTorch si se requieren transformers
```

**FastAPI (Framework)**

```python
# Vs Flask/Django:
✓ Async/await nativo (concurrencia)
✓ Type hints automáticas
✓ OpenAPI docs automática
✓ 2x más rápido que Flask
✓ Ideal para microservicios
```

**Celery + Redis (Job Queue)**

```python
# Procesamiento asincrónico:
@app.task
def parse_sms_batch(sms_list):
    # Procesar 1000 SMS sin bloquear
    pass
```

### Companion Apps: Swift (iOS) + Kotlin (Android)

**Swift + SwiftUI (iOS)**

```swift
// Decisión:
✓ Acceso nativo a UserNotificationCenter
✓ Apple Push Notifications (APNs)
✓ SwiftUI moderna (declarativa desde iOS 13)
✓ Integración con Keychain (almacenar tokens seguros)
✓ Background App Refresh para captura continua
```

**Kotlin + Jetpack Compose (Android)**

```kotlin
// Razones:
✓ Google lo promueve activamente
✓ Coroutines para async (similar a async/await JS)
✓ BroadcastReceiver para SMS nativo
✓ Firebase Cloud Messaging para push
✓ Jetpack Compose (UI declarativa, futuro de Android)
```

### DevOps: Docker + Kubernetes + Terraform

**Docker (Contenedores)**

```dockerfile
# Ventajas:
✓ Reproducible en dev/staging/prod
✓ Rápido de deployar (< 1 minuto)
✓ Escalable con orchestrators
```

**Kubernetes (Orquestación)**

```yaml
# Para fase 2+:
✓ Auto-scaling basado en CPU
✓ Rollouts automáticos
✓ Health checks
✓ Service discovery automático
```

**Terraform (IaC)**

```hcl
# Infraestructura como código:
✓ Reproducible
✓ Control de versiones
✓ Fácil de teardown/recrear
✓ Multi-cloud support
```

**GitHub Actions (CI/CD)**

```yaml
# Por qué no Jenkins:
✓ Nativo en GitHub (menos tools)
✓ Cheaper (incluido con repo)
✓ Mantenimiento 0 (SaaS)
✓ Workflows declarativos (.yml)
```

## Alternativas Consideradas

### Backend

| Opción | Pros | Contras |
|--------|------|---------|
| **NestJS (ELEGIDA)** | Opinado, DI, escalable | Overhead inicial |
| Express.js | Simple, minimalista | Sin DI, loose structure |
| Django (Python) | "batteries included" | Overkill para API, template bloat |
| Go (Gin/Echo) | Ultra rápido | Team no sabe Go |
| Spring Boot (Java) | Enterprise, escalable | Heavy, JVM startup lento |

### BD

| Opción | Pros | Contras |
|--------|------|---------|
| **PostgreSQL (ELEGIDA)** | ACID, JSON, stable | Más overhead que MySQL |
| MySQL | Ligero | ACID solo InnoDB, JSON less featured |
| MongoDB | Flexible schema | Sin ACID nativo, no ideal para transacciones |
| CockroachDB | Distributed, SQL | Costoso, overkill fase MVP |

### Frontend

| Opción | Pros | Contras |
|--------|------|---------|
| **React + Vite (ELEGIDA)** | Ecosystem, maturity | Community opinionation |
| Vue.js | Curva aprendizaje menor | Comunidad 2-3x más pequeña |
| Next.js | SSR built-in | Overkill para PWA, routing opinionado |
| Flutter Web | Mismo lang iOS/Android | Immature, performance issues |
| Svelte | Performance, DX | Comunidad aún pequeña, jobs escasos |

### NLP

| Opción | Pros | Contras |
|--------|------|---------|
| **Python + spaCy (ELEGIDA)** | Modelos pre-trained, ecosystem | Performance vs C++ |
| Rust (nlprule) | Rápido, memory safe | Pequeña comunidad |
| Node.js (natural.js) | Mismo lenguaje backend | Pobre soporte NER/parsing |

### Mobile

| Opción | Pros | Contras |
|--------|------|---------|
| **Swift + Kotlin nativo (ELEGIDA)** | Performance, features nativas | 2 codebases |
| React Native | 1 codebase | Overhead, SMS unreliable |
| Flutter | Performance, hermoso UI | Equipo no sabe Dart |
| Ionic (PWA mejorado) | 1 codebase | Sigue siendo PWA, SMS mismo problema |

## Consecuencias

### Positivas

1. **Equipo puede ser productivo día 1:** Stack conocido (TS/React/Node)
2. **Comunidades activas:** Problemas resueltos, libs disponibles
3. **Escalable:** NestJS → Microservicios, PostgreSQL → Replicación, K8s
4. **Hiring fácil:** TypeScript/React engineer abundantes en Latam
5. **DevOps simple:** Docker/K8s son estándares de industria
6. **Testing maduro:** Jest, Cypress, Playwright todos excelentes

### Negativas

1. **Node.js no es ideal para CPU-heavy:** NLP Service en Python (mitiga)
2. **Costos más altos que Go/Rust:** Node/Python usan más RAM
3. **TypeORM a veces tiene quirks:** Pero mejor alternativa no existe en Node
4. **React no es opinado:** Necesita disciplina en estructura (Clean Architecture lo resuelve)

## Stack Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Frontend Layer                                          │
│ React 18 + Vite + TailwindCSS + Redux + TanStack Query │
└─────────────────────────────────────────────────────────┘
                         ↓ (HTTP/WebSocket)
┌─────────────────────────────────────────────────────────┐
│ API Gateway                                             │
│ NestJS + JWT + Rate Limiting                           │
└─────────────────────────────────────────────────────────┘
         ↓                  ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│ Auth Service │  │Transaction   │  │ Analytics Service │
│ NestJS       │  │ Service      │  │ NestJS            │
└──────────────┘  │ NestJS       │  └──────────────────┘
                  └──────────────┘
         ↓                ↓
    ┌─────────┐    ┌──────────┐
    │PostgreSQL   │  │  Redis  │
    │ ACID, JSON  │  │ Cache   │
    └─────────┘    │  Queue   │
                   └──────────┘

┌─────────────────────────────────────────────────────────┐
│ NLP Service Layer                                       │
│ Python + FastAPI + spaCy + Celery                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Companion Apps                                          │
│ iOS: Swift + SwiftUI   │ Android: Kotlin + Compose     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ DevOps                                                  │
│ Docker + Kubernetes + Terraform + GitHub Actions       │
└─────────────────────────────────────────────────────────┘
```

## Roadmap Tecnológico

**Fase 1 (MVP, 2-3 meses):**
- NestJS monolito + React PWA
- PostgreSQL + Redis
- Python NLP service básico
- GitHub Actions simple (test + lint)

**Fase 2 (6-12 meses, escala):**
- Kubernetes con HPA
- Microservicios: Auth, Transactions, Analytics
- Caché distribuido (Redis Cluster)
- Analytics engine (BigQuery / Data Lake)

**Fase 3 (1-2 años, optimizaciones):**
- CQRS + Event Sourcing
- GraphQL (opcional, paralelo a REST)
- ML models custom (TensorFlow)
- Real-time sync WebSocket

## Licencias

- TypeScript, NestJS, Express: MIT
- React, Vite: MIT
- PostgreSQL: PostgreSQL License (open source)
- Redis: Redis Source Available (open source con limits)
- Python, spaCy: MIT
- Swift: Apache 2.0 (open source)
- Kotlin: Apache 2.0 (open source)

Ningún componente tiene restricción comercial.

## Revisión

**Próxima revisión:** Después de MVP (3 meses) o si Team crece >5 engineers
