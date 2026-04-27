import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import TransactionItem from '../../components/ui/TransactionItem';
import { useTransactions, useUpdateTransaction } from '../../hooks/useTransactions';
import { Transaction } from '../../types';
import { formatDate } from '../../utils/format';
import ModalTransactionForm from './ModalTransactionForm';

const TransactionsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const { data: transactionsData, isLoading, refetch } = useTransactions(1, 1000);
  const updateTransaction = useUpdateTransaction();

  const transactions = transactionsData?.data || [];

  // Filter transactions
  const filtered = transactions.filter((t) => {
    let typeMatch = true;
    if (filter === 'income') typeMatch = t.type === 'income';
    else if (filter === 'expense') typeMatch = t.type === 'expense';
    else if (filter === 'pending') typeMatch = !t.confirmed;

    const searchMatch =
      !searchTerm ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.merchant.toLowerCase().includes(searchTerm.toLowerCase());

    return typeMatch && searchMatch;
  });

  // Group by date
  const grouped = filtered.reduce(
    (acc, t) => {
      const date = formatDate(t.transaction_date);
      if (!acc[date]) acc[date] = [];
      acc[date].push(t);
      return acc;
    },
    {} as Record<string, Transaction[]>
  );

  const handleConfirm = async (id: string) => {
    try {
      await updateTransaction.mutateAsync({
        id,
        updates: { confirmed: true },
      });
    } catch (error) {
      console.error('Error confirmando transacción:', error);
    }
  };

  const handleDelete = async (id: string) => {
    // En una app real, habría confirmación
    try {
      // deleteTransaction.mutateAsync(id);
    } catch (error) {
      console.error('Error eliminando transacción:', error);
    }
  };

  return (
    <AppShell>
      <div className="px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar transacción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'income', 'expense', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' && 'Todos'}
              {f === 'income' && 'Ingresos'}
              {f === 'expense' && 'Gastos'}
              {f === 'pending' && 'Pendientes'}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay transacciones</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600"
            >
              Agregar movimiento
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([date, dateTransactions]) => (
              <div key={date}>
                <h3 className="px-4 py-2 text-sm font-semibold text-gray-900 bg-gray-50 sticky top-0 z-10">
                  {date}
                </h3>
                <Card className="overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {dateTransactions.map((transaction) => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        onClick={() => setSelectedTransactionId(transaction.id)}
                      />
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* FAB */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-30 active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {showAddModal && (
        <ModalTransactionForm onClose={() => setShowAddModal(false)} />
      )}
    </AppShell>
  );
};

export default TransactionsPage;
