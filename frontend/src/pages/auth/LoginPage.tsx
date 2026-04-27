import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../services/api';
import { AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const response = await authApi.login(data.email, data.password);
      login(response.user, response.access_token, response.refresh_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Correo o contraseña inválidos');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">FinzApp</h1>
          <p className="text-gray-600">Gestiona tus finanzas personales</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-expense flex-shrink-0" />
            <p className="text-sm text-expense font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input
              {...register('email')}
              type="email"
              placeholder="tu@correo.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email && (
              <p className="text-xs text-expense">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.password && (
              <p className="text-xs text-expense">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" isLoading={isSubmitting} size="md" className="w-full mt-6">
            Iniciar sesión
          </Button>
        </form>

        {/* Register link */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
