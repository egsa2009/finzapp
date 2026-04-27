import React from 'react';
import { Transaction } from '../../types';
import { formatCOP, formatDate, categoryColor } from '../../utils/format';
import { cn } from '../../utils/cn';
import { AlertCircle } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Alimentación': '🍕',
    'Transporte': '🚕',
    'Entretenimiento': '🎬',
    'Servicios': '⚡',
    'Salud': '🏥',
    'Educación': '📚',
    'Otros': '📌',
    'Ingresos': '💰',
  };
  return icons[category] || '💳';
};

const sourceLabels: Record<string, string> = {
  'sms': 'SMS',
  'push': 'PUSH',
  'manual': 'MANUAL',
};

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onClick,
}) => {
  const amountColor = transaction.type === 'income' ? 'text-income' : 'text-expense';
  const amountSign = transaction.type === 'income' ? '+' : '-';

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-surface transition-colors"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="text-2xl">{getCategoryIcon(transaction.category)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {transaction.description || transaction.merchant}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-500">{formatDate(transaction.transaction_date)}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {sourceLabels[transaction.source]}
            </span>
            {!transaction.confirmed && (
              <span className="inline-flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-warning" />
                <span className="text-xs text-warning font-medium">Pendiente</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={cn('text-right font-semibold text-sm', amountColor)}>
        {amountSign}{formatCOP(transaction.amount)}
      </div>
    </div>
  );
};

export default TransactionItem;
