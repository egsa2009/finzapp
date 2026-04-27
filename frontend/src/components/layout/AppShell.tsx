import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutGrid, TrendingUp, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useUser } from '../../hooks/useUser';
import { cn } from '../../utils/cn';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { data: currentUser } = useUser();

  const currentUserData = currentUser || user;
  const initials = currentUserData?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { path: '/transactions', label: 'Movimientos', icon: TrendingUp },
    { path: '/reports', label: 'Reportes', icon: BarChart3 },
    { path: '/settings', label: 'Configuración', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-screen bg-surface">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-gray-200 safe-top">
        <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">FinzApp</h1>
          </div>

          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
            title="Cerrar sesión"
          >
            {initials}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-14 pb-20 max-w-md mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-gray-200 max-w-md mx-auto w-full safe-bottom">
        <div className="flex items-center justify-around">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-3 px-2 text-xs font-medium transition-colors min-h-[60px]',
                isActive(path)
                  ? 'text-primary border-t-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
