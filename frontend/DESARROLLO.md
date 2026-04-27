# Guía de desarrollo - FinzApp Frontend

## Comandos principales

```bash
# Instalar dependencias
npm install

# Desarrollo local (hot reload)
npm run dev

# Compilar y verificar tipos
npm run build

# Preview de build
npm run preview

# Verificar tipos TypeScript
npm run lint
```

## Configuración inicial

### 1. Variables de entorno

Crear `.env.local` en la raíz:

```
VITE_API_URL=http://localhost:3000
```

Para producción:
```
VITE_API_URL=https://api.finzapp.com
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instala:
- React 18 + React DOM
- React Router v6
- TanStack React Query v5
- Zustand (state management)
- Axios (HTTP client)
- Recharts (gráficas)
- React Hook Form + Zod (formularios)
- TailwindCSS (estilos)
- Lucide React (iconos)
- Vite PWA Plugin (PWA setup)

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

La app abrirá en `http://localhost:5173`

## Estructura de archivos importante

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── pages/            # Páginas de la app
│   ├── hooks/            # Custom hooks React Query
│   ├── services/         # Cliente API
│   ├── store/            # Estado global (Zustand)
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Funciones auxiliares
│   ├── App.tsx           # Componente root + router
│   ├── main.tsx          # Entry point
│   └── index.css         # Estilos globales
├── public/
│   └── manifest.json     # PWA manifest
├── index.html            # Template HTML
├── vite.config.ts        # Configuración Vite
├── tailwind.config.js    # Configuración Tailwind
├── tsconfig.json         # Configuración TypeScript
└── package.json          # Dependencias
```

## Desarrollo de componentes

### Crear un nuevo componente UI

```typescript
// src/components/ui/MiComponente.tsx
import React from 'react';
import { cn } from '../../utils/cn';

interface MiComponenteProps {
  children: React.ReactNode;
  className?: string;
}

const MiComponente: React.FC<MiComponenteProps> = ({ 
  children, 
  className 
}) => (
  <div className={cn('px-4 py-2', className)}>
    {children}
  </div>
);

export default MiComponente;
```

### Crear un custom hook

```typescript
// src/hooks/useMiHook.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useMiHook() {
  return useQuery({
    queryKey: ['mi-dato'],
    queryFn: () => api.get('/mi-endpoint'),
    staleTime: 60000,
  });
}
```

### Crear una página

```typescript
// src/pages/app/MiPaginaPage.tsx
import React from 'react';
import AppShell from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';

const MiPaginaPage: React.FC = () => {
  return (
    <AppShell>
      <div className="px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold">Mi página</h1>
        <Card className="p-4">
          Contenido aquí
        </Card>
      </div>
    </AppShell>
  );
};

export default MiPaginaPage;
```

## Agregar nueva ruta

En `src/App.tsx`:

```typescript
<Route
  path="/mi-pagina"
  element={
    <ProtectedRoute>
      <MiPaginaPage />
    </ProtectedRoute>
  }
/>
```

## Patrones comunes

### Componente con loading/error

```typescript
const { data, isLoading, error } = useMiHook();

if (isLoading) return <div>Cargando...</div>;
if (error) return <div>Error: {error.message}</div>;

return <div>{data}</div>;
```

### Formulario con validación

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  nombre: z.string().min(3),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('email')} />
    {errors.email && <span>{errors.email.message}</span>}
  </form>
);
```

### Llamada API con invalidación

```typescript
const mutation = useMutation({
  mutationFn: (data) => api.post('/endpoint', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['mi-dato'] });
  },
});

await mutation.mutateAsync(data);
```

## Styling con TailwindCSS

La app usa **únicamente TailwindCSS** (no CSS custom).

### Clases útiles

```html
<!-- Padding/Margin -->
<div class="p-4 m-2">

<!-- Flexbox -->
<div class="flex items-center justify-between gap-2">

<!-- Grid -->
<div class="grid grid-cols-2 gap-4">

<!-- Text -->
<h1 class="text-2xl font-bold text-primary">

<!-- Colors -->
<button class="bg-primary text-white">  <!-- Azul -->
<button class="bg-income">              <!-- Verde -->
<button class="bg-expense">             <!-- Rojo -->
<button class="bg-warning">             <!-- Amarillo -->

<!-- Responsive -->
<div class="md:grid-cols-3 lg:grid-cols-4">

<!-- Hover/Focus -->
<button class="hover:bg-blue-600 focus:ring-2 focus:ring-primary">

<!-- States -->
<button class="disabled:opacity-50">
<input class="focus:outline-none focus:ring-2 focus:ring-primary">
```

## Testing

Para agregar tests, instalar:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

## Debugging

### Console logs
```typescript
console.log('valor:', miValor);
console.error('error:', error);
```

### React DevTools
Instalar extensión del navegador "React Developer Tools"

### Network tab
Ver requests en DevTools → Network → Filtrar por "api"

## Convenciones

### Nombres de archivos
- Componentes: `MiComponente.tsx` (PascalCase)
- Hooks: `useMiHook.ts` (camelCase)
- Utils: `formato.ts` (camelCase)
- Páginas: `MiPaginaPage.tsx` (PascalCase + Page)

### Estructura de componentes
```typescript
// Imports
import React from 'react';

// Tipos
interface Props { ... }

// Componente
const MiComponente: React.FC<Props> = ({ ... }) => {
  return (
    <div>...</div>
  );
};

// Nombre display
MiComponente.displayName = 'MiComponente';

// Export
export default MiComponente;
```

### Manejo de errores
```typescript
try {
  await mutation.mutateAsync(data);
} catch (error) {
  console.error('Error:', error);
  // Mostrar mensaje al usuario
}
```

## Performance

### Code splitting automático
Vite hace code-splitting automático en rutas

### React Query
- Cache automático con staleTime
- Invalidación selectiva
- Retry automático en errores

### TailwindCSS
- Solo clases usadas en build final
- PurgeCSS automático

## PWA en desarrollo

Para testear PWA localmente:

1. Build: `npm run build`
2. Servir con HTTPS (requerido para Service Worker)
3. Instalar: Menu → Instalar o "+" en barra dirección

## Recursos

- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [TailwindCSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

## Solución de problemas

### "Cannot find module"
```bash
npm install
```

### Port 5173 en uso
```bash
npm run dev -- --port 3001
```

### TypeScript errors
```bash
npm run lint
```

### Limpiar cache
```bash
rm -rf node_modules package-lock.json
npm install
```

## Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Docker (con Nginx)
Ver `Dockerfile` en la raíz del proyecto

## Variables de entorno por ambiente

### Development (.env.local)
```
VITE_API_URL=http://localhost:3000
```

### Production (.env.production)
```
VITE_API_URL=https://api.finzapp.com
```

### Staging (.env.staging)
```
VITE_API_URL=https://api-staging.finzapp.com
```
