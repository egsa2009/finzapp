import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { useCreateTransaction } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { Transaction } from '../../types';

const transactionSchema = z.object({
  amount: z.string().refine((val) => parseInt(val) > 0, 'Monto debe ser mayor a 0'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().min(1, 'Agrégale una descripción'),
  merchant: z.string().optional(),
  transaction_date: z.string(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface ModalTransactionFormProps {
  onClose: () => void;
}

const ModalTransactionForm: React.FC<ModalTransactionFormProps> = ({ onClose }) => {
  const createTransaction = useCreateTransaction();
  const { data: categories = [] } = useCategories();
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
        amount: parseInt(data.amount),
        type: data.type,
        category: data.category,
        description: data.description,
        merchant: data.merchant || data.description,
        source: 'manual',
        confirmed: true,
        transaction_date: data.transaction_date,
      };

      await createTransaction.mutateAsync(transaction);
      reset();
      onClose();
    } catch (error) {
      console.error('Error creando transacción:', error);
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      (selectedType === 'income' && cat.name === 'Ingresos') ||
      (selectedType === 'expense' && cat.name !== 'Ingresos')
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-2xl p-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Agregar movimiento</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedType('income')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                selectedType === 'income'
                  ? 'bg-income text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('expense')}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                selectedType === 'expense'
                  ? 'bg-expense text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Gasto
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Monto (COP)</label>
            <input
              {...register('amount')}
              type="number"
              placeholder="0"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.amount && (
              <p className="text-xs text-expense">{errors.amount.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              {...register('category')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecciona una categoría</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-expense">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <input
              {...register('description')}
              type="text"
              placeholder="p.ej. Desayuno en café"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.description && (
              <p className="text-xs text-expense">{errors.description.message}</p>
            )}
          </div>

          {/* Merchant */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Comercio (opcional)</label>
            <input
              {...register('merchant')}
              type="text"
              placeholder="p.ej. Café The Bloom"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              {...register('transaction_date')}
              type="date"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.transaction_date && (
              <p className="text-xs text-expense">{errors.transaction_date.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="md"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || createTransaction.isPending}
              size="md"
              className="flex-1"
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTransactionForm;
