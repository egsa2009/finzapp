import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, PaginatedResponse, User, Transaction, Category, ReportSummary, CategoryReport, AntReport } from '../types';
import { useAuthStore } from '../store/auth.store';

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Request interceptor: agregar token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { logout, setTokens, refreshToken } = useAuthStore.getState();

    if (error.response?.status === 401) {
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', { refresh_token: refreshToken });
          const newAccessToken = response.data.data.access_token;
          setTokens(newAccessToken, refreshToken);

          // Reintentar request original
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(error.config);
          }
        } catch {
          logout();
          window.location.href = '/login';
        }
      } else {
        logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{
      access_token: string;
      refresh_token: string;
      user: User;
    }>>('/auth/login', { email, password });
    return response.data.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post<ApiResponse<{
      access_token: string;
      refresh_token: string;
      user: User;
    }>>('/auth/register', { name, email, password });
    return response.data.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<{
      access_token: string;
    }>>('/auth/refresh', { refresh_token: refreshToken });
    return response.data.data;
  },

  logout: async () => {
    await api.post<ApiResponse<null>>('/auth/logout');
  },
};

// Transaction endpoints
export const transactionsApi = {
  list: async (page = 1, limit = 50, filters?: { type?: string; category?: string; start_date?: string; end_date?: string }) => {
    const response = await api.get<ApiResponse<PaginatedResponse<Transaction>>>('/transactions', {
      params: { page, limit, ...filters },
    });
    return response.data.data;
  },

  create: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', transaction);
    return response.data.data;
  },

  update: async (id: string, updates: Partial<Transaction>) => {
    const response = await api.patch<ApiResponse<Transaction>>(`/transactions/${id}`, updates);
    return response.data.data;
  },

  delete: async (id: string) => {
    await api.delete<ApiResponse<null>>(`/transactions/${id}`);
  },

  confirm: async (id: string) => {
    const response = await api.patch<ApiResponse<Transaction>>(`/transactions/${id}/confirm`, {});
    return response.data.data;
  },
};

// Reports endpoints
export const reportsApi = {
  summary: async (startDate?: string, endDate?: string) => {
    const response = await api.get<ApiResponse<ReportSummary>>('/reports/summary', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data.data;
  },

  categories: async (startDate?: string, endDate?: string) => {
    const response = await api.get<ApiResponse<CategoryReport[]>>('/reports/categories', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data.data;
  },

  ants: async (startDate?: string, endDate?: string) => {
    const response = await api.get<ApiResponse<AntReport>>('/reports/ants', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data.data;
  },
};

// Categories endpoints
export const categoriesApi = {
  list: async () => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  create: async (name: string, color: string, icon: string) => {
    const response = await api.post<ApiResponse<Category>>('/categories', {
      name,
      color,
      icon,
    });
    return response.data.data;
  },
};

// Users endpoints
export const usersApi = {
  me: async () => {
    const response = await api.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },

  update: async (updates: Partial<User>) => {
    const response = await api.patch<ApiResponse<User>>('/users/me', updates);
    return response.data.data;
  },
};

export default api;
