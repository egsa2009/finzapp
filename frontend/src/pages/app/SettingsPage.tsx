import React, { useState } from 'react';
import { ChevronRight, LogOut } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useUser, useUpdateUser } from '../../hooks/useUser';
import { useAuthStore } from '../../store/auth.store';
import { useCategories, useCreateCategory } from '../../hooks/useCategories';
import { formatCOP } from '../../utils/format';

const BANKS = [
  { id: 'bancolombia', name: 'Bancolombia' },
  { id: 'davivienda', name: 'Davivienda' },
  { id: 'nequi', name: 'Nequi' },
  { id: 'daviplata', name: 'DaviPlata' },
  { id: 'bbva', name: 'BBVA' },
  { id: 'scotiabank', name: 'Scotiabank' },
];

const SettingsPage: React.FC = () => {
  const { data: user } = useUser();
  const updateUser = useUpdateUser();
  const { data: categories = [] } = useCategories();
  const logout = useAuthStore((state) => state.logout);
  const [newCategoryName, setNewCategoryName] = useState('');
  const createCategory = useCreateCategory();
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(user?.monthly_budget || 0);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory.mutateAsync({
        name: newCategoryName,
        color: '#9CA3AF',
        icon: '📌',
      });
      setNewCategoryName('');
    } catch (error) {
      console.error('Error creando categoría:', error);
    }
  };

  const handleSaveBudget = async () => {
    if (!user) return;
    try {
      await updateUser.mutateAsync({
        monthly_budget: tempBudget,
      });
      setEditingBudget(false);
    } catch (error) {
      console.error('Error actualizando presupuesto:', error);
    }
  };

  return (
    <AppShell>
      <div className="px-4 py-6 space-y-6">
        {/* Profile Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Perfil</h2>
          <Card className="p-4 space-y-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Nombre</p>
              <p className="text-gray-900 font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Correo</p>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
          </Card>
        </div>

        {/* Budget Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Presupuesto</h2>
          <Card className="p-4 space-y-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Presupuesto mensual</p>
              {editingBudget ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={tempBudget}
                    onChange={(e) => setTempBudget(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleSaveBudget}
                    className="px-3 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempBudget(user?.monthly_budget || 0);
                    setEditingBudget(true);
                  }}
                  className="flex items-center justify-between w-full group"
                >
                  <p className="text-gray-900 font-medium">{formatCOP(user?.monthly_budget || 0)}</p>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </button>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-1">Día de pago</p>
              <p className="text-gray-900 font-medium">{user?.pay_day}</p>
            </div>
          </Card>
        </div>

        {/* Banks Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Bancos activos</h2>
          <Card className="divide-y">
            {BANKS.map((bank) => {
              const isActive = user?.banks?.includes(bank.id);
              return (
                <div key={bank.id} className="flex items-center justify-between p-4">
                  <p className="text-gray-900 font-medium">{bank.name}</p>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => {
                      if (!user) return;
                      const newBanks = e.target.checked
                        ? [...(user.banks || []), bank.id]
                        : user.banks?.filter((b) => b !== bank.id) || [];
                      updateUser.mutate({ banks: newBanks });
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
              );
            })}
          </Card>
        </div>

        {/* Categories Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Categorías</h2>
          <Card className="p-4 space-y-3">
            {/* Existing categories */}
            {categories
              .filter((c) => c.is_custom)
              .map((cat) => (
                <div key={cat.id} className="flex items-center justify-between py-2">
                  <p className="text-gray-900 font-medium">{cat.name}</p>
                  <button className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded">
                    Eliminar
                  </button>
                </div>
              ))}

            {/* Add new category */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nueva categoría"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || createCategory.isPending}
                className="px-3 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 text-sm"
              >
                Agregar
              </button>
            </div>
          </Card>
        </div>

        {/* Privacy Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Privacidad</h2>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-medium">Conservar texto original SMS</p>
              <p className="text-xs text-gray-600">Guarda el mensaje completo para referencia</p>
            </div>
            <input
              type="checkbox"
              checked={user?.preserve_sms_text || false}
              onChange={(e) => {
                if (!user) return;
                updateUser.mutate({ preserve_sms_text: e.target.checked });
              }}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </Card>
        </div>

        {/* Logout Section */}
        <div>
          <Button
            onClick={handleLogout}
            variant="danger"
            size="md"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </Button>
        </div>

        {/* Spacing for bottom nav */}
        <div className="h-4" />
      </div>
    </AppShell>
  );
};

export default SettingsPage;
