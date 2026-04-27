import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import BudgetProgress from '../../components/ui/BudgetProgress';
import { Card, CardContent } from '../../components/ui/Card';
import TransactionItem from '../../components/ui/TransactionItem';
import { useReportSummary } from '../../hooks/useReports';
import { useTransactions } from '../../hooks/useTransactions';
import { useUser } from '../../hooks/useUser';
import { formatCOP } from '../../utils/format';
import ModalTransactionForm from './ModalTransactionForm';

const DashboardPage: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: user } = useUser();
  const { data: report, isLoading: reportLoading } = useReportSummary();
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(1, 5);

  const today = new Date();
  const monthName = today.toLocaleString('es-CO', { month: 'long' });
  const greeting = `Hola, ${user?.name?.split(' ')[0] || 'Usuario'}`;

  const transactions = transactionsData?.data || [];
  const pendingCount = transactions.filter((t) => !t.confirmed).length;

  const netBalance = (report?.total_income ?? 0) - (report?.total_expense ?? 0);
  const incomeChange = report
    ? ((report.total_income - report.previous_period_income) / report.previous_period_income) * 100
    : 0;
  const expenseChange = report
    ? ((report.total_expense - report.previous_period_expense) / report.previous_period_expense) * 100
    : 0;

  return (
    <AppShell>
      <div className="px-4 py-6 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting}</h1>
          <p className="text-gray-600 text-sm mt-1">
            {today.getDate()} de {monthName}
          </p>
        </div>

        {/* Budget Card */}
        {report && user && (
          <Card className="p-4 bg-blue-50 border-primary/20">
            <BudgetProgress
              spent={report.total_expense}
              budget={user.monthly_budget}
              alertPercent={80}
            />
          </Card>
        )}

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs text-gray-600 mb-1">Ingresos</p>
            <p className="text-xl font-bold text-income">
              {formatCOP(report?.total_income ?? 0)}
            </p>
            {incomeChange !== 0 && (
              <p className={`text-xs mt-1 ${incomeChange > 0 ? 'text-income' : 'text-expense'}`}>
                {incomeChange > 0 ? '+' : ''}{incomeChange.toFixed(1)}% vs mes anterior
              </p>
            )}
          </Card>

          <Card className="p-4">
            <p className="text-xs text-gray-600 mb-1">Gastos</p>
            <p className="text-xl font-bold text-expense">
              {formatCOP(report?.total_expense ?? 0)}
            </p>
            {expenseChange !== 0 && (
              <p className={`text-xs mt-1 ${expenseChange > 0 ? 'text-expense' : 'text-income'}`}>
                {expenseChange > 0 ? '+' : ''}{expenseChange.toFixed(1)}% vs mes anterior
              </p>
            )}
          </Card>

          <Card className="p-4">
            <p className="text-xs text-gray-600 mb-1">Saldo neto</p>
            <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCOP(netBalance)}
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-xs text-gray-600 mb-1">Proyección mes</p>
            <p className="text-xl font-bold text-primary">
              {formatCOP(report?.month_projection ?? 0)}
            </p>
          </Card>
        </div>

        {/* Pending Alert */}
        {pendingCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-warning/10 border border-warning/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning">
                {pendingCount} movimiento{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-600">Confirma para actualizar tus reportes</p>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Movimientos recientes</h2>
            <Link to="/transactions" className="text-primary text-sm font-medium hover:underline">
              Ver todos
            </Link>
          </div>

          <Card className="overflow-hidden">
            {transactionsLoading ? (
              <div className="p-4 text-center text-gray-500">Cargando...</div>
            ) : transactions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No hay movimientos aún
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30 active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Modal */}
      {showAddModal && (
        <ModalTransactionForm onClose={() => setShowAddModal(false)} />
      )}
    </AppShell>
  );
};

export default DashboardPage;
