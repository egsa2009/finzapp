import React from 'react';
import { cn } from '../../utils/cn';
import { categoryColor } from '../../utils/format';

interface CategoryBadgeProps {
  name: string;
  icon?: string;
  className?: string;
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

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ name, icon, className }) => {
  const displayIcon = icon || getCategoryIcon(name);
  const color = categoryColor(name);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white',
        className
      )}
      style={{ backgroundColor: color }}
    >
      <span>{displayIcon}</span>
      <span>{name}</span>
    </span>
  );
};

export default CategoryBadge;
