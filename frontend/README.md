# FinzApp Frontend - PWA React

PWA mobile-first para gestión de finanzas personales en Colombia. Construida con React 18, Vite, TypeScript y TailwindCSS.

## Características

- Autenticación segura con JWT
- Dashboard con presupuesto y KPIs
- Listado y gestión de transacciones
- Reportes con gráficas (Ingresos vs Gastos, Por Categoría, Gastos Hormiga)
- Notificaciones de transacciones pendientes
- Configuración de presupuesto y bancos
- Instalación como app nativa (PWA)
- Soporte offline con Service Worker
- WCAG AA compliant
- Mobile-first (360-430px)

## Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Routing**: React Router v6
- **Estado**: Zustand
- **Data Fetching**: TanStack React Query
- **Styling**: TailwindCSS
- **Gráficas**: Recharts
- **Formularios**: React Hook Form + Zod
- **API**: Axios
- **PWA**: Vite PWA Plugin + Workbox
- **UI**: Lucide React Icons

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Variables de entorno

Crear `.env.local`:

```
VITE_API_URL=http://localhost:3000
```

## Build para producción

```bash
npm run build
```

## Estructura de carpetas

```
src/
├── components/
│   ├── ui/              # Componentes reutilizables (Button, Card, etc)
│   └── layout/          # Layouts (AppShell, ProtectedRoute)
├── pages/
│   ├── auth/            # Páginas de autenticación (Login, Register, Onboarding)
│   └── app/             # Páginas principales (Dashboard, Transactions, etc)
├── hooks/               # Custom hooks React Query
├── services/            # Cliente Axios con interceptores
├── store/               # Estado global con Zustand
├── types/               # Tipos TypeScript
├── utils/               # Funciones auxiliares
├── App.tsx              # Router principal
├── main.tsx             # Entry point
└── index.css            # Estilos globales
```

## Componentes principales

### UI Components
- `Button`: Botón con variantes (primary, secondary, danger, ghost) y tamaños
- `Card`: Contenedor con estilos predeterminados
- `BudgetProgress`: Barra de progreso del presupuesto
- `TransactionItem`: Item de transacción en lista
- `CategoryBadge`: Badge de categoría con ícono

### Layout Components
- `AppShell`: Layout principal con header, nav y footer
- `ProtectedRoute`: Protección de rutas autenticadas

### Pages
- `LoginPage`: Autenticación con email y contraseña
- `RegisterPage`: Registro de nuevo usuario
- `OnboardingPage`: Wizard de 5 pasos para configuración inicial
- `DashboardPage`: Vista principal con resumen y movimientos recientes
- `TransactionsPage`: Listado completo de transacciones con filtros
- `ReportsPage`: 3 tabs con reportes gráficos
- `SettingsPage`: Configuración de perfil, presupuesto, bancos, categorías

## Hooks principales

- `useTransactions()`: Listado de transacciones
- `useCreateTransaction()`: Crear transacción
- `useUpdateTransaction()`: Actualizar transacción
- `useDeleteTransaction()`: Eliminar transacción
- `useReportSummary()`: Resumen de reportes
- `useReportCategories()`: Datos por categoría
- `useReportAnts()`: Análisis de gastos hormiga
- `useCategories()`: Listado de categorías
- `useUser()`: Datos del usuario actual
- `useUpdateUser()`: Actualizar usuario

## API Endpoints

El cliente espera los siguientes endpoints en la API:

```
POST   /auth/login
POST   /auth/register
POST   /auth/logout
POST   /auth/refresh

GET    /transactions
POST   /transactions
PATCH  /transactions/:id
DELETE /transactions/:id
PATCH  /transactions/:id/confirm

GET    /reports/summary
GET    /reports/categories
GET    /reports/ants

GET    /categories
POST   /categories

GET    /users/me
PATCH  /users/me
```

## Estilos y colores

Colores del Design System:
- Primary: #1F6FEB (azul)
- Income: #22C55E (verde)
- Expense: #EF4444 (rojo)
- Warning: #F59E0B (amarillo)
- Surface: #F8FAFC (gris claro)
- Card: #FFFFFF (blanco)

## PWA y Service Worker

La aplicación es una PWA completa:
- Instalable en home screen
- Offline-ready con caching
- Notificaciones push
- Icons adaptivos

El Service Worker se registra automáticamente en `App.tsx`.

## Licencia

Privado - FinzApp
