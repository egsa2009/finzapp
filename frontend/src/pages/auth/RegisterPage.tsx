import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../services/api';
import { AlertCircle } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(3, 'Mínimo 3 caracteres'),
    email: z.string().email('Correo inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, 'Debes aceptar los términos'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      const response = await authApi.register(data.name, data.email, data.password);
      login(response.user, response.access_token, response.refresh_token);
      navigate('/onboarding');
    } catch (err) {
      setError('No se pudo completar el registro. Intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">FinzApp</h1>
          <p className="text-gray-600">Crea tu cuenta</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-expense flex-shrink-0" />
            <p className="text-sm text-expense font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              {...register('name')}
              type="text"
              placeholder="Tu nombre completo"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            {errors.name && (
              <p className="text-xs text-expense">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Correo</label>
            <input
              {...register('email')}
              type="email"
              placeholder="tu@correo.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            {errors.email && (
              <p className="text-xs text-expense">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            {errors.password && (
              <p className="text-xs text-expense">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-expense">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start gap-2 py-2">
            <input
              {...register('terms')}
              type="checkbox"
              id="terms"
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
            />
            <label htmlFor="terms" className="text-xs text-gray-600">
              Acepto los términos y condiciones de FinzApp
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-expense">{errors.terms.message}</p>
          )}

          <Button type="submit" isLoading={isSubmitting} size="md" className="w-full mt-4">
            Crear cuenta
          </Button>
        </form>

        {/* Login link */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
