import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useUpdateUser } from '../../hooks/useUser';

const BANKS = [
  { id: 'bancolombia', name: 'Bancolombia', logo: '🏦' },
  { id: 'davivienda', name: 'Davivienda', logo: '🏦' },
  { id: 'nequi', name: 'Nequi', logo: '📱' },
  { id: 'daviplata', name: 'DaviPlata', logo: '📱' },
  { id: 'bbva', name: 'BBVA', logo: '🏦' },
  { id: 'scotiabank', name: 'Scotiabank', logo: '🏦' },
];

interface OnboardingData {
  banks: string[];
  budget: number;
  payDay: number;
}

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const updateUser = useUpdateUser();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    banks: [],
    budget: 2000000,
    payDay: 1,
  });

  const steps = [
    {
      title: '¿Qué bancos usas?',
      description: 'Selecciona los bancos de los que quieres rastrear movimientos',
    },
    {
      title: 'Configura tu presupuesto',
      description: 'Define tu presupuesto mensual y día de pago',
    },
    {
      title: 'Activa notificaciones (Android)',
      description: 'Sigue estos pasos para recibir alertas en tiempo real',
    },
    {
      title: 'Configuración para iOS',
      description: 'Configura los Shortcuts automáticos',
    },
    {
      title: '¡Todo listo!',
      description: 'Tu cuenta está lista para comenzar',
    },
  ];

  const handleNext = async () => {
    if (step === steps.length - 1) {
      try {
        await updateUser.mutateAsync({
          monthly_budget: data.budget,
          pay_day: data.payDay,
          banks: data.banks,
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Error actualizando usuario:', error);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const toggleBank = (bankId: string) => {
    setData((prev) => ({
      ...prev,
      banks: prev.banks.includes(bankId)
        ? prev.banks.filter((id) => id !== bankId)
        : [...prev.banks, bankId],
    }));
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 bg-primary text-white sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">{steps[step].title}</h1>
          <p className="text-blue-100 text-sm">{steps[step].description}</p>

          {/* Progress bar */}
          <div className="mt-4 flex gap-1.5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index <= step ? 'bg-white' : 'bg-blue-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          {step === 0 && (
            <div className="space-y-3">
              {BANKS.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => toggleBank(bank.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    data.banks.includes(bank.id)
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{bank.logo}</span>
                    <span className="font-medium text-gray-900">{bank.name}</span>
                  </div>
                  {data.banks.includes(bank.id) && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presupuesto mensual (COP)
                </label>
                <input
                  type="number"
                  value={data.budget}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      budget: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Día de pago (1-31)
                </label>
                <select
                  value={data.payDay}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      payDay: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      Día {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 text-sm">
                <li>Ve a Configuración → Aplicaciones → FinzApp → Permisos</li>
                <li>Habilita SMS en "Permisos de solicitud especial"</li>
                <li>Ve a Notificaciones y asegúrate que estén habilitadas</li>
                <li>Agrega los números de tus bancos a tu lista de contactos</li>
              </ol>
              <button className="w-full mt-4 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-600">
                Solicitar permisos
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 bg-purple-50 p-4 rounded-lg">
              <ol className="list-decimal list-inside space-y-3 text-gray-700 text-sm">
                <li>Abre Atajos (Shortcuts) en tu iPhone</li>
                <li>Ve a Mis atajos → Crear atajo</li>
                <li>Busca "Enviar SMS" y configura tu banco</li>
                <li>En Automatización, establece que se active con nuevos SMS</li>
                <li>Descarga nuestro template desde finzapp.com/ios</li>
              </ol>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-income flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Cuenta configurada</h2>
                <p className="text-gray-600 text-sm">
                  Presupuesto: ${data.budget.toLocaleString()} COP
                </p>
                <p className="text-gray-600 text-sm">
                  Día de pago: {data.payDay}
                </p>
                <p className="text-gray-600 text-sm">
                  Bancos: {data.banks.length} seleccionados
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={step === 0}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>
          <button
            onClick={handleNext}
            disabled={
              (step === 0 && data.banks.length === 0) ||
              updateUser.isPending
            }
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {step === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            {step !== steps.length - 1 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
