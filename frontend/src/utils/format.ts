export function formatCOP(amount: number): string {
  return `$ ${Math.round(amount).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (dateOnly.getTime() === today.getTime()) {
    return 'Hoy';
  }

  if (dateOnly.getTime() === yesterday.getTime()) {
    return 'Ayer';
  }

  const months = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];

  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function categoryColor(categoryName: string): string {
  const colors: Record<string, string> = {
    'Alimentación': '#EF4444',
    'Transporte': '#F59E0B',
    'Entretenimiento': '#8B5CF6',
    'Servicios': '#06B6D4',
    'Salud': '#EC4899',
    'Educación': '#3B82F6',
    'Otros': '#6B7280',
    'Ingresos': '#22C55E',
  };

  return colors[categoryName] || '#9CA3AF';
}

export function getMonthName(date: Date): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[date.getMonth()];
}

export function getShortMonthName(date: Date): string {
  const months = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];
  return months[date.getMonth()];
}

export function formatDateLong(date: string): string {
  const d = new Date(date);
  return `${d.getDate()} de ${getMonthName(d)} de ${d.getFullYear()}`;
}
