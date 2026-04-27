import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import { Card, CardContent } from '../../components/ui/Card';
import { useReportSummary, useReportCategories, useReportAnts } from '../../hooks/useReports';
import { formatCOP, formatPercent, getShortMonthName } from '../../utils/format';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'categories' | 'ants'>('comparison');
  const { data: summary } = useReportSummary();
  const { data: categoriesData } = useReportCategories();
  const { data: antsData } = useReportAnts();

  // Prepare chart data for comparison
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      name: getShortMonthName(d),
      income: Math.random() * 5000000,
      expense: Math.random() * 3000000,
    });
  }

  const COLORS = [
    '#EF4444',
    '#F59E0B',
    '#FBBF24',
    '#34D399',
    '#10B981',
    '#22C55E',
    '#6B7280',
  ];

  return (
    <AppShell>
      <div className="px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'comparison' as const, label: 'Ingresos vs Gastos' },
            { id: 'categories' as const, label: 'Por Categoría' },
            { id: 'ants' as const, label: 'Hormiga' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'comparison' && (
          <div className="space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <p className="text-xs text-gray-600 mb-1">Ingresos mes actual</p>
                <p className="text-lg font-bold text-income">
                  {formatCOP(summary?.total_income ?? 0)}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-gray-600 mb-1">Gastos mes actual</p>
                <p className="text-lg font-bold text-expense">
                  {formatCOP(summary?.total_expense ?? 0)}
                </p>
              </Card>
            </div>

            {/* Chart */}
            <Card className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => formatCOP(value as number)}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#22C55E" name="Ingresos" />
                  <Bar dataKey="expense" fill="#EF4444" name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            {/* Pie Chart */}
            {categoriesData && categoriesData.length > 0 && (
              <Card className="p-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoriesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {categoriesData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCOP(value as number)}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Category Bars */}
            {categoriesData && categoriesData.length > 0 && (
              <div className="space-y-2">
                {categoriesData.map((cat, index) => (
                  <Card key={cat.name} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-500">{cat.count} transacciones</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatCOP(cat.amount)}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{formatPercent(cat.percentage)}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ants' && (
          <div className="space-y-4">
            {!antsData || antsData.groups.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-lg font-semibold text-gray-900">¡Excelente!</p>
                <p className="text-gray-600 text-sm mt-2">
                  No se detectaron gastos repetitivos. Mantén el buen hábito.
                </p>
              </Card>
            ) : (
              <>
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <p className="text-sm text-blue-900">
                    Ahorro potencial anual:{' '}
                    <span className="font-bold">{formatCOP(antsData.total_savings_potential)}</span>
                  </p>
                </Card>

                <div className="space-y-3">
                  {antsData.groups.map((group, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{group.merchant}</p>
                          <p className="text-xs text-gray-500">{group.category}</p>
                        </div>
                        <p className="text-right">
                          <p className="font-bold text-expense">{formatCOP(group.total_month)}</p>
                          <p className="text-xs text-gray-600">{group.frequency}x/mes</p>
                        </p>
                      </div>

                      <div className="bg-gray-100 rounded-lg p-2 mt-3">
                        <p className="text-xs text-gray-700">
                          Si reduces a 1 vez/semana, ahorras{' '}
                          <span className="font-semibold text-income">
                            {formatCOP(group.savings_potential)}
                          </span>
                          /mes
                        </p>
                      </div>

                      <p className="text-xs text-gray-600 mt-2">
                        Proyección anual: {formatCOP(group.projection_year)}
                      </p>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default ReportsPage;
