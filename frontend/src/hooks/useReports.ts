import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../services/api';

export function useReportSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'summary', startDate, endDate],
    queryFn: () => reportsApi.summary(startDate, endDate),
    staleTime: 300000,
  });
}

export function useReportCategories(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'categories', startDate, endDate],
    queryFn: () => reportsApi.categories(startDate, endDate),
    staleTime: 300000,
  });
}

export function useReportAnts(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'ants', startDate, endDate],
    queryFn: () => reportsApi.ants(startDate, endDate),
    staleTime: 300000,
  });
}
