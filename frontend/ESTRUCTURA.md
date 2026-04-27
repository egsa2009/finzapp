# Estructura Frontend PWA - FinzApp

## Resumen de implementación

PWA React 18 completa para gestión de finanzas personales colombianas. Mobile-first, WCAG AA, 44px+ touch targets.

## Archivos creados

### Configuración y build
- `package.json` - Dependencias: React 18, Vite, React Router 6, TanStack Query 5, TailwindCSS, Recharts, Zustand, React Hook Form, Zod, Lucide, PWA
- `vite.config.ts` - Vite + PWA plugin, proxy API, precaching
- `tsconfig.json` - TypeScript 5.2, strict mode
- `tsconfig.node.json` - Configuración para vite.config.ts
- `tailwind.config.js` - Tokens de color SDD, Inter font
- `postcss.config.js` - Tailwind + Autoprefixer
- `.env.example` - Variables de entorno
- `.gitignore` - Node, dist, .env

### Público
- `index.html` - Meta tags PWA, viewport, Apple tags
- `public/manifest.json` - PWA manifest con nombre, iconos, tema

### Tipos y utilidades
- `src/types/index.ts` - Todas las interfaces (User, Transaction, Category, Reports, etc)
- `src/utils/format.ts` - formatCOP, formatDate, formatPercent, categoryColor
- `src/utils/cn.ts` - Utilidad clsx + tailwind-merge

### Servicios
- `src/services/api.ts` - Cliente Axios con interceptores (auth, refresh, error handling)
  - authApi.login, register, logout, refresh
  - transactionsApi.list, create, update, delete, confirm
  - reportsApi.summary, categories, ants
  - categoriesApi.list, create
  - usersApi.me, update

### Estado global
- `src/store/auth.store.ts` - Zustand store (user, tokens, isAuthenticated, login, logout)

### Hooks personalizados
- `src/hooks/useTransactions.ts` - useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, useConfirmTransaction
- `src/hooks/useReports.ts` - useReportSummary, useReportCategories, useReportAnts
- `src/hooks/useCategories.ts` - useCategories, useCreateCategory
- `src/hooks/useUser.ts` - useUser, useUpdateUser

### Componentes UI
- `src/components/ui/Button.tsx` - 4 variantes, 3 tamaños, loading state, 44px min
- `src/components/ui/Card.tsx` - Card + CardHeader + CardTitle + CardContent + CardFooter
- `src/components/ui/BudgetProgress.tsx` - Barra progresiva (verde/amarilla/roja), porcentaje
- `src/components/ui/TransactionItem.tsx` - Item lista con ícono, descripción, monto, source badge, pendiente badge
- `src/components/ui/CategoryBadge.tsx` - Badge con ícono emoji y color

### Componentes Layout
- `src/components/layout/AppShell.tsx` - Header fijo + Main content + Bottom nav (Dashboard, Movimientos, Reportes, Configuración)
- `src/components/layout/ProtectedRoute.tsx` - Wrapper que verifica autenticación, redirige a /login

### Páginas Autenticación
- `src/pages/auth/LoginPage.tsx` - Form con email/password, zod validation, error messages, link a registro
- `src/pages/auth/RegisterPage.tsx` - Form con name/email/password/confirm, términos checkbox, validación
- `src/pages/auth/OnboardingPage.tsx` - Wizard 5 pasos:
  1. Seleccionar bancos (Bancolombia, Davivienda, Nequi, DaviPlata, BBVA, Scotiabank)
  2. Presupuesto mensual + día de pago
  3. Android SMS + notificaciones (instrucciones)
  4. iOS Shortcuts (instrucciones)
  5. Resumen configuración
  Con progress bar, botones Anterior/Siguiente

### Páginas Aplicación
- `src/pages/app/DashboardPage.tsx` - Saludo personalizado, BudgetProgress, KPIs (ingresos/gastos/saldo/proyección), últimas 5 transacciones, FAB +, banner de pendientes
- `src/pages/app/TransactionsPage.tsx` - Search bar, filtros chips (Todos/Ingresos/Gastos/Pendientes), listado agrupado por fecha, FAB +
- `src/pages/app/ModalTransactionForm.tsx` - Modal para agregar transacción (monto, tipo, categoría, descripción, comercio, fecha)
- `src/pages/app/ReportsPage.tsx` - 3 tabs:
  1. **Ingresos vs Gastos**: BarChart 6 meses, KPIs con cambio %
  2. **Por Categoría**: PieChart donut + barras horizontales por categoría con porcentaje
  3. **Gastos Hormiga**: Burbujas de gastos repetitivos con frecuencia y ahorro potencial
- `src/pages/app/SettingsPage.tsx` - Secciones de Perfil, Presupuesto, Bancos activos, Categorías personalizadas, Privacidad, Logout

### Punto de entrada
- `src/App.tsx` - Router React Router v6, QueryClientProvider, registro Service Worker, rutas públicas/protegidas
- `src/main.tsx` - StrictMode, render root
- `src/index.css` - Importación Google Fonts Inter, Tailwind, estilos globales, safe areas, touch targets

### Documentación
- `README.md` - Guía completa de instalación, uso, estructura, endpoints API
- `ESTRUCTURA.md` - Este archivo (resumen de la implementación)

## Características implementadas

### Autenticación
- Login con email/password
- Registro con validación
- JWT refresh token automático
- Logout con limpieza de estado
- ProtectedRoute para rutas privadas

### Transacciones
- Crear, listar, actualizar, eliminar, confirmar
- Filtros por tipo (ingreso/gasto) y estado (pendiente)
- Search por descripción/comercio
- Agrupación por fecha
- Modal de edición
- FAB para crear rápido

### Reportes
- BarChart: Ingresos vs Gastos últimos 6 meses
- PieChart: Distribución por categoría
- Análisis de gastos hormiga con potencial de ahorro
- KPIs con comparativas mes anterior

### Presupuesto
- BudgetProgress visual (3 estados: verde/amarilla/roja)
- Alertas al 80%
- Configuración de presupuesto mensual
- Día de pago personalizado

### Dashboard
- Saludo personalizado
- Resumen de KPIs
- Movimientos recientes
- Proyección de mes
- Alerta de transacciones pendientes
- FAB flotante

### PWA
- Instalable (manifest.json)
- Service Worker con precaching
- NetworkFirst para /api/
- CacheFirst para fonts
- Soporte offline
- Theme color #1F6FEB
- Icons 192x192 y 512x512

### UX/Accesibilidad
- Mobile-first (360-430px)
- Touch targets ≥ 44px
- WCAG AA (colores, contraste, navegación)
- Responsive ResponsiveContainer en gráficas
- Loading states en botones
- Error messages claros
- Validación de formularios

### Formato
- Montos en COP ($ X.XXX formato colombiano)
- Fechas en español (Hoy, Ayer, 23 abr)
- Porcentajes (80%)
- Colores por categoría (emoji + color hex)

## Tecnologías utilizadas

| Paquete | Propósito |
|---------|-----------|
| react@18 | Framework UI |
| react-router-dom@6 | Routing |
| @tanstack/react-query@5 | Fetch + cache |
| axios | HTTP client |
| recharts | Gráficas |
| zustand | Estado global |
| react-hook-form | Formularios |
| zod | Validación |
| tailwindcss | Estilos |
| lucide-react | Iconos |
| clsx + tailwind-merge | Utilities CSS |
| vite-plugin-pwa | PWA |
| workbox-window | Service worker |

## Para iniciar

```bash
cd /sessions/ecstatic-elegant-brahmagupta/mnt/Presupuesto\ personal/finzapp/frontend
npm install
npm run dev
```

Luego navega a `http://localhost:5173`

## Notas importantes

- API_URL debe estar configurada en .env.local
- Service Worker se registra automáticamente
- Zustand store persiste en localStorage
- React Query cachea con staleTime de 60s
- Todos los componentes usan TypeScript strict
- TailwindCSS únicamente (sin CSS custom)
- Textos en español colombiano
