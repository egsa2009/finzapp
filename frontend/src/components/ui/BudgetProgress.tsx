import React from 'react';
import { cn } from '../../utils/cn';
import { formatCOP, formatPercent } from '../../utils/format';

interface BudgetProgressProps {
  spent: number;
  budget: number;
  alertPercent?: number;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ spent, budget, alertPercent = 80 }) => {
  const percentage = Math.min((spent / budget) * 100, 100);
  const isAlert = percentage >= alertPercent && percentage < 100;
  const isExceeded = percentage >= 100;

  let bgColor = 'bg-income';
  if (isExceeded) {
    bgColor = 'bg-expense';
  } else if (isAlert) {
    bgColor = 'bg-warning';
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Presupuesto</span>
        <span className="text-sm font-semibold text-gray-900">{formatPercent(percentage)}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', bgColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">
          {formatCOP(spent)} de {formatCOP(budget)}
        </span>
        {isExceeded && (
          <span className="text-xs font-semibold text-expense">
            {formatCOP(spent - budget)} excedido
          </span>
        )}
      </div>
    </div>
  );
};

export default BudgetProgress;
