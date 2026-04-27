# FinzApp - Documentación Arquitectónica - Índice

**Fecha:** Abril 2026  
**Versión:** 1.0  
**Rol:** AGENTE ARQUITECTO

## Archivos Creados

### 1. **architecture-overview.md** (14 KB)
Visión general completa de la arquitectura de FinzApp.

**Contenido:**
- Diagrama ASCII de componentes
- Descripción de 4 capas (Presentación, API, Aplicación, Datos)
- Descripción de servicios principales (Auth, Transaction, NLP, Analytics, etc.)
- Flujos de datos principales (Captura SMS, Autenticación, Analytics)
- 5 Decisiones arquitectónicas clave
- 8 Patrones de diseño utilizados
- Estrategias de escalabilidad y rendimiento
- Medidas de seguridad
- DevOps y deployment
- Roadmap de 3 fases futuras

**Audiencia:** Tech leads, architects, senior engineers  
**Tiempo de lectura:** 20 minutos

---

### 2. **folder-structure.md** (32 KB)
Árbol COMPLETO del proyecto con descripción de cada carpeta y archivo.

**Contenido:**
- Estructura root del monorepo
- Backend: 8 niveles profundos (domain, application, infrastructure, presentation, common, config)
- Frontend: Components, hooks, store, API, services, types, styles
- NLP Service: Services, patterns, ML models, queue, config
- Companion Apps: iOS (Swift), Android (Kotlin) con vista completa
- DevOps: Docker, Kubernetes, Terraform, GitHub Actions, monitoring, nginx
- Docs: Guías, tutoriales, API docs
- Scripts: Setup, migrations, seeding

**Audiencia:** Todo el equipo (developers, devops, QA)  
**Tiempo de referencia:** Búsqueda puntual (no lectura completa)

---

### 3. **coding-standards.md** (6.1 KB)
Estándares de código exhaustivos para TypeScript, NestJS, React, Python.

**Contenido:**
- 10 Principios generales (DRY, SOLID, Clean Code, etc.)
- TypeScript: Convenciones de nombres (variables, funciones, clases, archivos)
- NestJS específico: Módulos, Services, Controllers, DTOs, Guards, Decoradores, Error handling
- React específico: Componentes, Hooks, Redux Slices
- Python específico: Naming, Servicios, NLP patterns
- ESLint y Prettier configuration (.json files)
- Testing con Jest
- Git commits (Conventional)
- Checklist pre-commit
- Herramientas recomendadas

**Audiencia:** Developers (frontend, backend, NLP)  
**Tiempo de lectura:** 15 minutos

---

### 4. **adr/ADR-001-clean-architecture.md** (6.5 KB)
Decision Record: Arquitectura Clean + Modular Monolith para backend.

**Decisión:** Separar código en 4 capas (Domain → Application → Infrastructure → Presentation)

**Principales puntos:**
- Contexto: Pequeño equipo que crecerá, necesidad de escalabilidad
- Alternativas: Monolito tradicional, Microservicios inmediatos, Clean+Modular, Onion
- Patrones implementados: DTO, Repository, DI, Inyección de dependencias
- Roadmap evolución: Fase 1 (Monolito), Fase 2 (Microservicios), Fase 3 (CQRS)
- Métricas de éxito: Coverage, onboarding time, bug rate

**Estado:** Aceptado  
**Impacto:** Cómo organizamos TODO el código backend

---

### 5. **adr/ADR-002-stack-selection.md** (12 KB)
Decision Record: Selección del stack tecnológico completo.

**Decisión:** NestJS + PostgreSQL + Redis (backend), React + Vite + TailwindCSS (frontend), Python + FastAPI + spaCy (NLP), Swift + Kotlin (companion apps), Docker + K8s + Terraform (devops)

**Principales puntos:**
- Backend: NestJS vs Express/Django/Go/Spring → NestJS gana en opinión+DI
- BD: PostgreSQL vs MySQL/MongoDB/CockroachDB → PostgreSQL gana en ACID+JSON
- Frontend: React vs Vue/Next/Flutter/Svelte → React gana en ecosystem
- Build: Vite vs Webpack/CRA → Vite gana en velocidad
- Styling: TailwindCSS vs Material-UI/Styled → Tailwind gana en size+utility
- NLP: Python vs Rust/Node.js → Python gana en ecosystem NLP
- Mobile: Swift+Kotlin nativo vs React Native/Flutter → Nativo gana en features
- DevOps: Docker/K8s/Terraform/GitHub Actions

**Estado:** Aceptado  
**Impacto:** Qué tecnologías usamos (vs elegir algo ineficiente luego)

---

### 6. **adr/ADR-003-sms-notification-capture.md** (11 KB)
Decision Record: Estrategia de captura automática de SMS y push notifications.

**Decisión:** Hybrid approach = PWA + Companion apps nativas (iOS Shortcuts + Android BroadcastReceiver)

**Principales puntos:**
- Contexto: iOS forbids PWA SMS access (Apple restriction), Android sí
- Workaround iOS: Usar Apple Shortcuts app para automatización
- Android: BroadcastReceiver nativo con permiso SMS_READ
- PWA: Fallback para usuarios que no quieran instalar app
- Flujo: SMS/Push → Companion → Webhook backend → NLP → PostgreSQL → PWA
- Seguridad: JWT auth, rate limiting, deduplicación
- Privacidad: COLPRIVADA compliant, user in control
- Alternativas evaluadas: PWA solo (imposible), Twilio/SMS API (no banking access), Jailbreak (violates GDPR)

**Estado:** Aceptado  
**Impacto:** Cómo capturamos feature CORE (transacciones automáticas)

---

### 7. **adr/ADR-004-nlp-parser.md** (14 KB)
Decision Record: Motor NLP para parsing de SMS bancarios.

**Decisión:** Hybrid = Regex patterns (fast, high precision) + spaCy NER (flexible, entity recognition)

**Principales puntos:**
- Contexto: SMS bancarios tienen estructura semi-libre, necesita parseo automático
- Approach:
  1. Bank detection (regex)
  2. Bank-specific patterns (regex) → Extract amount, type, date
  3. spaCy NER → Extract beneficiary, merchant, location
  4. Confidence scoring → Flag low-confidence para user review
  5. Feedback loop → User corrections → Retrain modelo
- Alternativas: Pure regex (brittle), Transformers (slow+$), OpenAI API ($$+privacy), Manual entry (defeats purpose)
- Targets: >99% amount accuracy, >98% type accuracy, <500ms latency, >90% coverage
- Roadmap: Fase 1 (Regex+spaCy), Fase 2 (Custom NER), Fase 3 (DistilBERT fine-tuned)

**Estado:** Aceptado  
**Impacto:** Cómo parseamos automáticamente transacciones (ML core)

---

### 8. **adr/ADR-README.md** (4 KB)
Guía de cómo usar, leer y proponer ADRs.

**Contenido:**
- Qué es un ADR y beneficios
- Cómo leer un ADR (4 pasos)
- Cómo proponer ADR (5 pasos)
- Template para nuevos ADRs
- Resumen de 4 ADRs actuales
- Estadísticas (4 aceptados, 0 rechazados)
- Próximos ADRs en consideración
- Cómo contribuir

**Audiencia:** Todo el equipo (referencia cuando se proponga cambio arquitectónico)

---

## Estructura de Carpetas Documentación

```
finzapp/docs/
├── INDEX.md                          ← Estás aquí
├── architecture-overview.md          (14 KB) Overview general
├── folder-structure.md               (32 KB) Árbol completo del proyecto
├── coding-standards.md               (6.1 KB) Estándares código
├── competitive-analysis.md           (32 KB) Análisis competencia (existente)
├── API.md                            (TODO)
├── DEPLOYMENT.md                     (TODO)
├── guides/
│   ├── getting-started.md            (TODO)
│   ├── local-setup.md                (TODO)
│   ├── database-migrations.md        (TODO)
│   ├── testing-guide.md              (TODO)
│   ├── debugging.md                  (TODO)
│   └── contribution-workflow.md      (TODO)
├── adr/
│   ├── ADR-README.md                 ← Guía de ADRs
│   ├── ADR-001-clean-architecture.md (6.5 KB) Clean Architecture + Modular Monolith
│   ├── ADR-002-stack-selection.md    (12 KB) Stack tecnológico
│   ├── ADR-003-sms-notification-capture.md (11 KB) Captura SMS/Push
│   ├── ADR-004-nlp-parser.md         (14 KB) Motor NLP
│   └── (más ADRs futuros)
└── tutorials/
    ├── first-transaction.md          (TODO)
    ├── adding-new-bank.md            (TODO)
    ├── training-nlp-model.md         (TODO)
    └── customizing-dashboard.md      (TODO)
```

---

## Resumen de Contenido Creado

| Archivo | Size | Páginas | Audiencia | Propósito |
|---------|------|---------|-----------|----------|
| **architecture-overview.md** | 14 KB | 4 | Architects, Tech Leads | Visión general de componentes, capas, flujos |
| **folder-structure.md** | 32 KB | 5 | Todo el equipo | Referencia rápida: dónde va cada código |
| **coding-standards.md** | 6.1 KB | 2 | Developers | Convenciones nombre, estructura, testing |
| **ADR-001** | 6.5 KB | 2 | Tech decisions | Por qué Clean Architecture |
| **ADR-002** | 12 KB | 3 | Tech decisions | Por qué NestJS/React/Python/K8s |
| **ADR-003** | 11 KB | 3 | Product/Tech | Por qué companion apps + iOS Shortcuts |
| **ADR-004** | 14 KB | 3 | Tech/ML | Por qué Regex + spaCy, no transformers |
| **ADR-README.md** | 4 KB | 1 | Team process | Cómo usar ADRs |
| **TOTAL** | **99.6 KB** | **23** | | |

---

## Próximos Documentos a Crear (Out of Scope Actual)

- [ ] `API.md` — Especificación OpenAPI completa
- [ ] `DEPLOYMENT.md` — Guía step-by-step deployment producción
- [ ] `guides/getting-started.md` — Setup local en 15 minutos
- [ ] `guides/testing-guide.md` — Unit + Integration + E2E testing
- [ ] `tutorials/adding-new-bank.md` — Cómo agregar nuevo banco al parser NLP
- [ ] `ADR-005` — Estrategia de caché (Redis vs In-Memory)
- [ ] `ADR-006` — Escalabilidad de BD
- [ ] `ADR-007` — Autenticación 2FA

---

## Cómo Usar Esta Documentación

### 👨‍💼 Si eres Tech Lead / Architect:
1. Lee `architecture-overview.md` (20 min)
2. Lee todos los ADRs (30 min)
3. Usa `folder-structure.md` como referencia

### 👨‍💻 Si eres Developer Backend:
1. Lee `ADR-001` (Clean Architecture) (15 min)
2. Lee `ADR-002` (NestJS) (20 min)
3. Lee `coding-standards.md` (15 min)
4. Usa `folder-structure.md/backend` como guía
5. Cuando agregues features, sigue `ADR-001` structure

### 👨‍💻 Si eres Developer Frontend:
1. Lee `ADR-002` (React, Vite) (20 min)
2. Lee `coding-standards.md` (React section) (10 min)
3. Usa `folder-structure.md/frontend` como guía
4. Contribuye componentes siguiendo patterns

### 🤖 Si trabajas en NLP:
1. Lee `ADR-003` (Captura SMS) (15 min)
2. Lee `ADR-004` (Motor NLP) (20 min)
3. Lee `coding-standards.md` (Python section) (5 min)
4. Usa `folder-structure.md/nlp-service` como guía

### 🚀 Si trabajas en DevOps:
1. Lee `architecture-overview.md` (devops section) (10 min)
2. Lee `ADR-002` (Docker, K8s, Terraform) (20 min)
3. Usa `folder-structure.md/devops` como guía

### 🆕 Si eres nuevo en el equipo:
**Day 1:** `architecture-overview.md` (30 min) + `ADR-README.md` (5 min)  
**Day 2:** ADRs relevantes a tu rol (45 min)  
**Day 3:** `coding-standards.md` + `folder-structure.md` (45 min)  
**Week 1:** Setup local + first PR  

---

## Control de Versiones

Todos los documentos están versionados. Cambios significativos:
- Actualizar **VERSION** en header
- Crear entrada en **CHANGELOG** (TODO)
- Revisar en PR si afecta múltiples teams

---

## Feedback y Mejoras

Si encuentras errores o mejoras:
1. Abre issue con tag `docs:`
2. Propone cambio en PR
3. Requiere aprobación de Architect

---

**Documento creado por:** AGENTE ARQUITECTO  
**Fecha:** 26 Abril 2026  
**Estado:** Completo para Fase MVP  
**Próxima revisión:** Después de 3 meses de desarrollo o cuando equipo escale
