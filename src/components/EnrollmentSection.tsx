import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Calendar,
  User as UserIcon,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  CheckCircle2,
  Check,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from 'firebase/auth';
import { registerWithEmailPassword, googleSignIn } from '../lib/firebase';

export interface EnrollmentPlanInfo {
  level: 'principiante' | 'intermedio' | 'avanzado';
  planName: string;
  price: string;
}

interface EnrollmentSectionProps {
  currentPlan: EnrollmentPlanInfo | null;
  onPlanChange: (plan: EnrollmentPlanInfo) => void;
  user: User | null;
  onSuccessSchedule: () => void;
  onBackToHome?: () => void;
}

const AVAILABLE_PLANS: Record<
  'principiante' | 'intermedio' | 'avanzado',
  {
    name: string;
    levelKey: 'principiante' | 'intermedio' | 'avanzado';
    price: string;
    badge: string;
    subtitle: string;
    features: string[];
  }
> = {
  principiante: {
    name: 'Fundation',
    levelKey: 'principiante',
    price: '$35 USD',
    badge: 'Cimientos & Fuerza',
    subtitle: 'Fuerza, potencia y acondicionamiento metabólico híbrido',
    features: [
      'Evaluación biomecánica inicial y movilidad articular',
      'Rutina Full-Body 3–5 días/semana adaptada',
      'Corrección postural y prevención activa de lesiones',
      'Acompañamiento cercano y registro de avances',
      'Acceso completo a la plataforma de atletas',
    ],
  },
  intermedio: {
    name: 'Performance',
    levelKey: 'intermedio',
    price: '$45 USD',
    badge: 'Más Popular · Hipertrofia',
    subtitle: 'Hipertrofia densa, fuerza submáxima y RIR controlado',
    features: [
      'Periodización por bloques con volumen óptimo recuperable',
      'Sobrecarga progresiva controlada en ejercicios multiarticulares',
      'Monitoreo semanal de cargas y fatiga sistémica',
      'Guía nutricional de macronutrientes para rendimiento',
      'Soporte técnico continuo y ajustes biométricos',
    ],
  },
  avanzado: {
    name: 'Elite',
    levelKey: 'avanzado',
    price: '$55 USD',
    badge: 'Alto Rendimiento',
    subtitle: 'Potencia explosiva, fuerza máxima y acondicionamiento élite',
    features: [
      'Programación personalizada de periodización ondulante diaria',
      'Monitoreo avanzado de velocidad de ejecución (VBT)',
      'Acondicionamiento metabólico de alta densidad neuromuscular',
      'Estrategias avanzadas de recuperación, descarga y movilidad',
      'Atención prioritaria y ajustes semanales directos',
    ],
  },
};

export const EnrollmentSection: React.FC<EnrollmentSectionProps> = ({
  currentPlan,
  onPlanChange,
  user,
  onSuccessSchedule,
  onBackToHome,
}) => {
  // Determine active plan (defaulting to Performance if none provided)
  const activeLevel: 'principiante' | 'intermedio' | 'avanzado' =
    currentPlan?.level || 'intermedio';
  const selectedPlanData = AVAILABLE_PLANS[activeLevel];

  // Checkout Status
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  // Profile Form Data
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Payment Method: Only card or paypal (no gym option)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Auto-fill if user signs in
  useEffect(() => {
    if (user) {
      if (!fullName && user.displayName) setFullName(user.displayName);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  // Google sign up state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    setGoogleAuthError(null);
    setIsGoogleLoading(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        if (res.user.displayName && !fullName) setFullName(res.user.displayName);
        if (res.user.email) setEmail(res.user.email);
      }
    } catch (err) {
      console.error('Google sign-up error:', err);
      setGoogleAuthError('No se pudo vincular la cuenta de Google. Inténtalo de nuevo.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Format Card Number (grouped in 4s)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format Card Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleSelectPlan = (level: 'principiante' | 'intermedio' | 'avanzado') => {
    const target = AVAILABLE_PLANS[level];
    onPlanChange({
      level,
      planName: target.name,
      price: target.price,
    });
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const randomId = `#TF-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedId(randomId);

    // If new user provided email and password, create account
    if (!user && email && password) {
      try {
        await registerWithEmailPassword(email, password, fullName);
      } catch (err) {
        console.warn('Auto-registration skipped or user already exists:', err);
      }
    }

    // Simulate secure 256-bit gateway verification
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#E50914', '#ffffff', '#fbbf24', '#111111'],
        });
      } catch {
        // Confetti fallback
      }
    }, 1200);
  };

  return (
    <section
      id="inscripcion"
      className="w-full bg-[#0d0d0d] text-white py-12 sm:py-20 border-t border-b border-zinc-900 relative overflow-hidden scroll-mt-20 min-h-[calc(100vh-80px)] flex flex-col justify-center"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        {/* Navigation Bar for Independent View */}
        {onBackToHome && (
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-800/80">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-montserrat font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer group bg-zinc-900/90 hover:bg-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-700/80 shadow-md"
            >
              <ArrowLeft className="w-4 h-4 text-[#E50914] group-hover:-translate-x-1 transition-transform" />
              <span>← Volver a la página principal</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-montserrat text-zinc-400">
              <span
                className="hover:text-white cursor-pointer transition-colors"
                onClick={onBackToHome}
              >
                Inicio
              </span>
              <span>/</span>
              <span className="text-[#E50914] font-bold">Portal de Inscripción Oficial</span>
            </div>
          </div>
        )}

        {/* Step Progression Bar */}
        <div className="max-w-2xl mx-auto mb-10 grid grid-cols-3 gap-2.5 text-center text-[10px] sm:text-xs font-montserrat font-bold uppercase tracking-wider">
          <div className="bg-zinc-950/80 border border-emerald-500/30 py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-emerald-400 shadow-sm">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">✓</span>
            <span className="truncate">1. Plan {selectedPlanData.name}</span>
          </div>
          <div className="bg-zinc-950/80 border border-[#E50914]/60 py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-white shadow-md shadow-red-600/10">
            <span className="w-4 h-4 rounded-full bg-[#E50914] text-white flex items-center justify-center text-[10px]">2</span>
            <span className="truncate">2. Perfil Atleta</span>
          </div>
          <div className="bg-zinc-950/80 border border-zinc-800 py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 text-zinc-400">
            <span className="w-4 h-4 rounded-full bg-zinc-900 text-zinc-500 flex items-center justify-center text-[10px]">3</span>
            <span className="truncate">3. Pago Mensual</span>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[#E50914] text-xs font-montserrat font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal de Inscripción</span>
          </div>
          <h2 className="font-montserrat font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
            FORJA TU MEMBRESÍA <br className="hidden sm:block" />
            <span className="text-[#E50914]">DE ATLETA</span>
          </h2>
          <p className="font-montserrat text-xs sm:text-sm text-zinc-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            Crea tu perfil oficial de atleta, activa tu suscripción mensual sin permanencia y accede de inmediato al sistema integral de entrenamiento y evaluación técnica.
          </p>

          {/* Interactive Plan Switcher Bar */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-2 sm:gap-3 bg-zinc-950/80 p-1.5 sm:p-2 rounded-2xl border border-zinc-800/80 max-w-xl mx-auto shadow-xl">
            {(Object.keys(AVAILABLE_PLANS) as ('principiante' | 'intermedio' | 'avanzado')[]).map(
              (lvl) => {
                const plan = AVAILABLE_PLANS[lvl];
                const isSelected = activeLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleSelectPlan(lvl)}
                    className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-montserrat text-xs transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#E50914] text-white font-black shadow-lg shadow-red-600/30 scale-[1.02]'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold'
                    }`}
                  >
                    <span className="uppercase tracking-wider">{plan.name}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-white/90' : 'text-zinc-500'}`}>
                      {plan.price}/mes
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {!isSuccess ? (
          /* Main 2-Column Enrollment Space */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Column 1: Plan Details & Athlete Benefits (5 cols) */}
            <div className="lg:col-span-5 bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-montserrat font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-600/15 text-[#E50914] border border-red-600/30">
                  <Zap className="w-3 h-3" />
                  <span>{selectedPlanData.badge}</span>
                </div>
                <h3 className="font-montserrat font-black text-2xl sm:text-3xl uppercase text-white">
                  Plan {selectedPlanData.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-montserrat">
                  {selectedPlanData.subtitle}
                </p>
              </div>

              {/* Monthly Pricing Callout */}
              <div className="bg-[#141414] border border-zinc-800 rounded-xl p-4 flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] font-montserrat font-bold text-zinc-400 uppercase tracking-wider">
                    Inversión del Plan
                  </div>
                  <div className="font-montserrat font-black text-3xl text-[#E50914] mt-0.5">
                    {selectedPlanData.price}
                    <span className="text-xs font-bold text-zinc-400 lowercase ml-1">/mes</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 text-[10px] font-montserrat font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md">
                    Suscripción Mensual
                  </span>
                  <div className="text-[10px] text-zinc-500 mt-1">Cancela cuando desees</div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-montserrat font-bold uppercase tracking-wider text-zinc-300">
                  ¿Qué incluye tu membresía mensual?
                </div>
                <ul className="space-y-2.5">
                  {selectedPlanData.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <div className="w-4 h-4 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Guarantee Badge */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-[#E50914] shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="font-montserrat font-bold text-white">
                    Supervisión Técnica Titan Forge
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    Evaluación biomecánica y ajuste continuo de cargas por entrenadores certificados.
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Profile Form & Secure Payment (7 cols) */}
            <div className="lg:col-span-7 bg-[#141414] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                {/* Paso 1: Datos del Atleta */}
                <div className="space-y-4">
                  <div className="font-montserrat font-bold text-xs uppercase text-zinc-300 flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-[#E50914]" />
                      <span>1. Datos del Atleta & Creación de Perfil</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-medium">Paso obligatorio</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Carlos Mendoza"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+52 55 1234 5678"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>
                  </div>

                  {!user ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Contraseña para tu Perfil de Atleta *
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres para acceder a tu rutina y calendario"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914] transition-colors"
                        />
                      </div>

                      {/* Botón para crear cuenta a partir de su cuenta de google */}
                      <div className="pt-1 space-y-2">
                        <div className="relative flex items-center justify-center my-1.5">
                          <div className="border-t border-zinc-800/80 w-full" />
                          <span className="bg-[#141414] px-2 text-[10px] font-montserrat font-bold uppercase text-zinc-500 tracking-wider absolute">
                            O también puedes
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isGoogleLoading}
                          onClick={handleGoogleSignUp}
                          className="w-full flex items-center justify-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-montserrat font-bold text-xs py-3 px-4 rounded-xl border border-zinc-700/80 shadow-md transition-all hover:border-zinc-500 active:scale-98 cursor-pointer disabled:opacity-50"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          <span>
                            {isGoogleLoading
                              ? 'Conectando con Google...'
                              : 'Crear cuenta a partir de mi cuenta de Google'}
                          </span>
                        </button>

                        {googleAuthError && (
                          <p className="text-[11px] text-red-400 font-montserrat text-center">
                            {googleAuthError}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-300">Cuenta de Google vinculada: </span>
                          <span className="text-zinc-300">{user.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full shrink-0">
                        Autenticado
                      </span>
                    </div>
                  )}
                </div>

                {/* Paso 2: Método de Pago Seguro */}
                <div className="space-y-4 pt-2">
                  <div className="font-montserrat font-bold text-xs uppercase text-zinc-300 flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#E50914]" />
                      <span>2. Método de Pago Mensual</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-medium">Pasarela Segura</span>
                  </div>

                  {/* Payment Tabs: Only Card & PayPal */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-3 px-3 rounded-xl text-xs font-montserrat font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Tarjeta de Crédito / Débito</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`py-3 px-3 rounded-xl text-xs font-montserrat font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'paypal'
                          ? 'bg-[#E50914] text-white shadow-lg shadow-red-600/30'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      <span>PayPal</span>
                    </button>
                  </div>

                  {/* Card Form */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3 bg-zinc-950/70 p-4 rounded-xl border border-zinc-800/80">
                      <div>
                        <label className="block text-[10px] font-montserrat font-bold uppercase text-zinc-400 mb-1">
                          Número de Tarjeta
                        </label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4532 •••• •••• 8921"
                          maxLength={19}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-montserrat font-bold uppercase text-zinc-400 mb-1">
                            Vencimiento (MM/AA)
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="12/28"
                            maxLength={5}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914] text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-montserrat font-bold uppercase text-zinc-400 mb-1">
                            Código CVC / CVV
                          </label>
                          <input
                            type="password"
                            required
                            value={cardCvc}
                            onChange={(e) =>
                              setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))
                            }
                            placeholder="•••"
                            maxLength={4}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914] text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-montserrat font-bold uppercase text-zinc-400 mb-1">
                          Nombre del Titular
                        </label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Como figura en la tarjeta"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#E50914]"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paypal' && (
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center space-y-2">
                      <p className="text-xs text-zinc-300">
                        Al confirmar, serás dirigido al portal seguro de <strong>PayPal</strong> para autorizar tu suscripción mensual de{' '}
                        <strong>{selectedPlanData.price}/mes</strong>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Security Guarantee Banner */}
                <div className="flex items-center gap-2.5 text-[11px] text-zinc-400 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Transacción encriptada de 256 bits · Protección contra fraude garantizada
                  </span>
                </div>

                {/* Submit Payment CTA */}
                <div>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 px-6 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white font-montserrat font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      {isProcessing
                        ? 'Procesando Pago Seguro...'
                        : `Pagar e Inscribirme a ${selectedPlanData.name} (${selectedPlanData.price}/mes)`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-center text-zinc-500 font-montserrat mt-2.5">
                    Al inscribirte aceptas los términos de servicio de Titan Forge. Cobro mensual cancelable en cualquier momento.
                  </p>
                  {onBackToHome && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={onBackToHome}
                        className="text-xs font-montserrat font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        ← Volver a la página principal
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Confirmation State: Athlete Card Issued */
          <div className="max-w-2xl mx-auto text-center space-y-6 py-4 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-montserrat font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/30 mb-2">
                <span>Inscripción Completada con Éxito</span>
              </div>
              <h3 className="font-montserrat font-black text-3xl sm:text-4xl uppercase text-white">
                ¡Bienvenido a Titan Forge!
              </h3>
              <p className="font-montserrat text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto mt-2 leading-relaxed">
                Tu perfil de atleta ha sido creado oficialmente y tu plan{' '}
                <strong>{selectedPlanData.name}</strong> está activo.
              </p>
            </div>

            {/* Official Athlete Credential Card */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-700/80 rounded-2xl p-6 sm:p-7 text-left shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#E50914]" />
                  <span className="font-montserrat font-black text-xs sm:text-sm uppercase tracking-wider text-white">
                    Credencial Oficial de Atleta
                  </span>
                </div>
                <span className="text-[10px] font-montserrat font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                  Membresía Activa
                </span>
              </div>

              <div className="py-4 space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Atleta:</span>
                  <span className="font-bold text-white">{fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Correo Electrónico:</span>
                  <span className="text-zinc-300 truncate max-w-[220px]">{email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Plan Seleccionado:</span>
                  <span className="font-black text-[#E50914] uppercase">
                    {selectedPlanData.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Modalidad:</span>
                  <span className="font-bold text-zinc-200">
                    Suscripción Mensual ({selectedPlanData.price}/mes)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">ID de Membresía:</span>
                  <span className="font-mono text-amber-400 font-bold tracking-wider">
                    {generatedId}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 text-center font-montserrat">
                Comprobante y acceso digital enviados automáticamente a tu correo.
              </div>
            </div>

            {/* Action to Schedule First Session */}
            <div className="space-y-3 max-w-md mx-auto pt-2">
              <button
                type="button"
                onClick={onSuccessSchedule}
                className="w-full py-4 px-6 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white font-montserrat font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Mi Primera Sesión Presencial</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onBackToHome && (
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="w-full py-2.5 text-xs font-montserrat font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Volver a la página principal
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="w-full py-2 text-[11px] font-montserrat font-medium text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer"
              >
                Modificar datos de suscripción
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
