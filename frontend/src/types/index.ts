export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  monthly_budget: number;
  pay_day: number;
  banks: string[];
  preserve_sms_text: boolean;
  created_at: string;
  updated_at: string;
}

export type TransactionSource = 'sms' | 'push' | 'manual';
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  merchant: string;
  source: TransactionSource;
  source_text?: string;
  confirmed: boolean;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  is_custom: boolean;
  created_at: string;
}

export interface ClassificationRule {
  id: string;
  user_id: string;
  pattern: string;
  category: string;
  created_at: string;
}

export interface ReportSummary {
  period: string;
  total_income: number;
  total_expense: number;
  net_balance: number;
  previous_period_income: number;
  previous_period_expense: number;
  month_projection: number;
  pending_transactions_count: number;
}

export interface CategoryReport {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface AntGroup {
  merchant: string;
  category: string;
  frequency: number;
  total_month: number;
  projection_year: number;
  savings_potential: number;
}

export interface AntReport {
  groups: AntGroup[];
  total_ants: number;
  total_savings_potential: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}
