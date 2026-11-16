import React, { useState } from 'react';
import {
  User as UserIcon,
  CreditCard,
  Calendar,
  CheckCircle2,
  Play,
  Pause,
  Maximize2,
  Clock,
  Flame,
  Award,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Download,
  Receipt,
  Edit3,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Zap,
  Activity,
  Layers,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { EnrollmentPlanInfo } from './EnrollmentSection';
import {
  WeekPlan,
  ExerciseVideoItem,
  DEFAULT_WEEKS_DATA,
  ProgramLevel,
  WeeksByLevel,
  isDirectVideoFile,
} from '../data/titanForgeStore';

interface AthletePortalProps {
  user: User | null;
  planInfo: EnrollmentPlanInfo | null;
  weeksData?: WeekPlan[];
  weeksByLevel?: WeeksByLevel;
  onNavigateHome: () => void;
  onLogout: () => void;
  onScrollToBooking: () => void;
  trainerEmail?: string;
}

const WEEKS_DATA: WeekPlan[] = DEFAULT_WEEKS_DATA;

export const AthletePortal: React.FC<AthletePortalProps> = ({
  user,
  planInfo,
  weeksData,
  weeksByLevel,
  onNavigateHome,
  onLogout,
  onScrollToBooking,
  trainerEmail = 'amauryuchiha@gmail.com',
}) => {
  const planName = planInfo?.planName || 'Performance';
  const resolvedLevel: ProgramLevel =
    planName === 'Fundation' || planName === 'Elite' || planName === 'Performance'
      ? planName
      : 'Performance';
  const activeWeeks =
    (weeksByLevel && weeksByLevel[resolvedLevel]) ||
    (weeksData && weeksData.length > 0 ? weeksData : WEEKS_DATA);
  // Navigation tabs inside Portal: 'plan' | 'pago' | 'perfil'
  const [activeTab, setActiveTab] = useState<'plan' | 'pago' | 'perfil'>('plan');

  // Selected Week inside the training plan (1 to 4)
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  // Active Video Modal for magnified exercise execution
  const [activeVideoModal, setActiveVideoModal] = useState<ExerciseVideoItem | null>(null);

  // Completed exercise tracking state
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({
    'w1-d1-e1': true,
  });

  // User Profile Editable Data
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [athleteName, setAthleteName] = useState(
    user?.displayName || 'Carlos Mendoza'
  );
  const [athleteEmail, setAthleteEmail] = useState(
    user?.email || 'atleta@titanforge.com'
  );
  const [athletePhone, setAthletePhone] = useState('+52 55 4192 8831');
  const [athleteGoal, setAthleteGoal] = useState(
    'Hipertrofia miofibrilar y optimización de fuerza submáxima'
  );
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Membership & Billing calculations
  const planPrice = planInfo?.price || '$45 USD';
  const billingDay = 10; // 10th of every month
  const nextBillingDate = '10 de Diciembre de 2026';
  const membershipId = '#TF-842918';

  const toggleExerciseComplete = (id: string) => {
    setCompletedExercises((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#E50914', '#22c55e', '#ffffff'],
          });
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 3000);
  };

  const activeWeekData =
    activeWeeks.find((w) => w.weekNumber === selectedWeek) || activeWeeks[0];

  // Calculate completion percentage for the current week
  const allWeekExerciseIds = activeWeekData.days.flatMap((d) =>
    d.exercises.map((e) => e.id)
  );
  const completedCount = allWeekExerciseIds.filter(
    (id) => completedExercises[id]
  ).length;
  const progressPercent = Math.round(
    (completedCount / Math.max(allWeekExerciseIds.length, 1)) * 100
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col font-montserrat">
      {/* Portal Top Bar */}
      <header className="sticky top-0 z-40 bg-[#121212]/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          {/* Left: Branding & Portal Badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-2 group cursor-pointer"
              title="Volver a la página principal"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E50914] text-white font-black text-sm flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
                TF
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-black text-sm tracking-wider uppercase text-white leading-none">
                  Titan Forge
                </div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                  Centro de Alto Rendimiento
                </div>
              </div>
            </button>

            <span className="h-6 w-px bg-zinc-800 hidden sm:block" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-[#E50914] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal del Atleta</span>
            </div>
          </div>

          {/* Right: Quick actions & Profile badge */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la web</span>
            </button>

            <button
              type="button"
              onClick={onScrollToBooking}
              className="inline-flex items-center gap-1.5 bg-[#E50914] hover:bg-[#c90812] text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer shadow-md shadow-red-600/20"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar Sesión</span>
            </button>

            {/* User Mini Avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={athleteName}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 text-white font-bold text-xs flex items-center justify-center uppercase">
                  {athleteName[0]}
                </div>
              )}

              <button
                type="button"
                onClick={onLogout}
                className="text-xs text-zinc-400 hover:text-red-400 font-bold transition-colors cursor-pointer hidden sm:block"
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 sm:gap-6 border-t border-zinc-800/80 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'plan'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-4 h-4 text-[#E50914]" />
            <span>Plan de Entrenamiento (Semana 1 a 4)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pago')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'pago'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#E50914]" />
            <span>Datos de Pago & Membresía</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'perfil'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserIcon className="w-4 h-4 text-[#E50914]" />
            <span>Mis Datos Personales & Credencial</span>
          </button>
        </div>
      </header>

      {/* Main Portal View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Executive Summary Banner */}
        <div className="bg-gradient-to-r from-zinc-950 via-[#141414] to-zinc-950 border border-zinc-800/90 rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">
                Atleta Activo en Sistema Titan Forge
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Bienvenido, {athleteName}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Membresía asignada: <strong className="text-white uppercase">{planName}</strong> · Próximo cobro mensual programado para el <strong className="text-zinc-200">{nextBillingDate}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-right">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Membresía Oficial</div>
              <div className="text-sm font-black text-amber-400 font-mono">{membershipId}</div>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-2.5 text-right">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Inversión Mensual</div>
              <div className="text-sm font-black text-[#E50914]">{planPrice}/mes</div>
            </div>
          </div>
        </div>

        {/* TAB 1: PLAN DE ENTRENAMIENTO (SEMANA 1 A 4) CON VIDEOS */}
        {activeTab === 'plan' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Week Selector Bar (de la Semana 1 a la 4) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                    Plan de Entrenamiento por Semana (1 a 4)
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Selecciona una semana para abrir el apartado completo con los videos demostrativos y prescripción técnica.
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Progreso Semana {selectedWeek}: <strong>{progressPercent}%</strong></span>
                </div>
              </div>

              {/* Week Buttons Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {activeWeeks.map((week) => {
                  const isCurrent = selectedWeek === week.weekNumber;
                  return (
                    <button
                      key={week.weekNumber}
                      type="button"
                      onClick={() => setSelectedWeek(week.weekNumber)}
                      className={`p-4 rounded-xl text-left transition-all border cursor-pointer relative overflow-hidden group ${
                        isCurrent
                          ? 'bg-[#181818] border-[#E50914] ring-2 ring-red-600/30 shadow-lg'
                          : 'bg-[#121212] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/15 rounded-full blur-xl pointer-events-none" />
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isCurrent
                              ? 'bg-[#E50914] text-white'
                              : 'bg-zinc-800 text-zinc-400 group-hover:text-white'
                          }`}
                        >
                          Semana {week.weekNumber}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">
                          {week.phaseName}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-white line-clamp-1">
                        {week.title.split(':')[1]?.trim() || week.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                        {week.rirTarget}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apartado de la Semana Seleccionada */}
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              {/* Week Header & Overview */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800/90 gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E50914] uppercase tracking-wider">
                    <Zap className="w-4 h-4" />
                    <span>Apartado de Entrenamiento · Semana {activeWeekData.weekNumber}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                    {activeWeekData.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
                    {activeWeekData.description}
                  </p>
                </div>

                {/* Coach Advice Callout */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 max-w-sm shrink-0 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase">
                    <Award className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>Instrucción del Coach Giovanni Mérida:</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-snug">
                    "{activeWeekData.coachAdvice}"
                  </p>
                </div>
              </div>

              {/* Week Progress Bar */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase">
                      Progreso de Ejercicios Realizados
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Has completado {completedCount} de {allWeekExerciseIds.length} ejercicios de la Semana {selectedWeek}.
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-64 flex items-center gap-3">
                  <div className="flex-1 bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-600 to-emerald-500 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-white shrink-0">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {/* Days & Exercise Videos Breakdown */}
              <div className="space-y-8 pt-2">
                {activeWeekData.days.map((day) => (
                  <div key={day.dayNumber} className="space-y-4">
                    {/* Day Header */}
                    <div className="flex items-center justify-between bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#E50914] text-white font-black text-xs flex items-center justify-center">
                          D{day.dayNumber}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white uppercase tracking-wide">
                            {day.dayName}
                          </div>
                          <div className="text-[11px] text-zinc-400">{day.focus}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{day.estimatedDuration}</span>
                      </div>
                    </div>

                    {/* Exercises Grid with Direct Video Previews */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {day.exercises.map((exercise) => {
                        const isDone = !!completedExercises[exercise.id];
                        return (
                          <div
                            key={exercise.id}
                            className={`bg-zinc-950/90 rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                              isDone
                                ? 'border-emerald-500/40 shadow-emerald-500/5'
                                : 'border-zinc-800/90 hover:border-zinc-700'
                            }`}
                          >
                            {/* Exercise Video Player Box */}
                            <div className="relative aspect-video w-full bg-black overflow-hidden group">
                              <img
                                src={exercise.videoThumbnail}
                                alt={exercise.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                              {/* Play Video Overlay Button */}
                              <button
                                type="button"
                                onClick={() => setActiveVideoModal(exercise)}
                                className="absolute inset-0 flex items-center justify-center gap-2 group-hover:scale-110 transition-transform cursor-pointer"
                                title="Ver video técnico en reproductor"
                              >
                                <div className="w-13 h-13 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-xl shadow-red-600/50 pl-0.5">
                                  <Play className="w-6 h-6 fill-white" />
                                </div>
                              </button>

                              {/* Badges on video */}
                              <div className="absolute top-3 left-3 flex items-center gap-2">
                                <span className="bg-black/80 backdrop-blur-md text-[10px] font-bold text-white uppercase px-2.5 py-1 rounded-md border border-white/20">
                                  {exercise.category}
                                </span>
                                <span className="bg-[#E50914]/90 text-[10px] font-bold text-white uppercase px-2 py-1 rounded-md">
                                  {exercise.muscleGroup.split(',')[0]}
                                </span>
                              </div>

                              <div className="absolute bottom-3 right-3">
                                <button
                                  type="button"
                                  onClick={() => setActiveVideoModal(exercise)}
                                  className="text-[11px] font-bold bg-white/20 hover:bg-white text-white hover:text-black backdrop-blur-md px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                  <span>Ver Video Técnico</span>
                                </button>
                              </div>
                            </div>

                            {/* Exercise Details Content */}
                            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                              <div className="space-y-2.5">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h4 className="font-black text-base text-white tracking-wide uppercase">
                                      {exercise.name}
                                    </h4>
                                    <div className="text-[11px] text-zinc-400 font-medium">
                                      Músculos: {exercise.muscleGroup}
                                    </div>
                                  </div>

                                  {/* Mark Complete Checkbox */}
                                  <button
                                    type="button"
                                    onClick={() => toggleExerciseComplete(exercise.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                      isDone
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-white'
                                    }`}
                                  >
                                    <Check className={`w-3.5 h-3.5 ${isDone ? 'stroke-[3]' : ''}`} />
                                    <span>{isDone ? 'Realizado' : 'Marcar'}</span>
                                  </button>
                                </div>

                                {/* Prescription Badges: Sets, Reps, RIR, Rest */}
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                  <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Series x Reps</div>
                                    <div className="font-bold text-white text-[11px] truncate">{exercise.setsReps}</div>
                                  </div>
                                  <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Intensidad</div>
                                    <div className="font-bold text-amber-400 text-[11px]">{exercise.rir}</div>
                                  </div>
                                  <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Descanso</div>
                                    <div className="font-bold text-zinc-300 text-[11px]">{exercise.rest}</div>
                                  </div>
                                </div>

                                {/* Technical Tips */}
                                <div className="space-y-1.5 text-xs bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                                  <div className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                                    <span>Puntos Clave de Ejecución:</span>
                                  </div>
                                  <ul className="space-y-1 text-zinc-300 text-[11px]">
                                    {exercise.technicalTips.map((tip, idx) => (
                                      <li key={idx} className="flex items-start gap-1.5 leading-snug">
                                        <span className="text-[#E50914] font-bold">▸</span>
                                        <span>{tip}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* Error común aviso */}
                              <div className="text-[10px] text-zinc-400 bg-red-950/20 border border-red-900/40 p-2 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                <span><strong className="text-red-300">Evitar:</strong> {exercise.commonMistakes}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DATOS DE PAGO & DÍA DEL CARGO */}
        {activeTab === 'pago' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                Datos de Pago & Membresía
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Consulta los detalles de tu suscripción mensual recurrente, próximo día de cobro y recibos emitidos.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Payment Summary Card (7 cols) */}
              <div className="lg:col-span-7 bg-[#141414] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-[#E50914]">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-white uppercase">
                        Suscripción Mensual Activa
                      </h3>
                      <div className="text-xs text-zinc-400">Titan Forge High Performance Plan</div>
                    </div>
                  </div>

                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                    Cobro Automático Activo
                  </span>
                </div>

                {/* Key Billing Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-1">
                    <div className="text-[11px] text-zinc-400 uppercase font-bold">Día de Cargo Mensual</div>
                    <div className="text-2xl font-black text-white">Día {billingDay} de cada mes</div>
                    <div className="text-[11px] text-zinc-500">Renovación automática recurrente</div>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-1">
                    <div className="text-[11px] text-zinc-400 uppercase font-bold">Próximo Cobro Programado</div>
                    <div className="text-2xl font-black text-[#E50914]">{nextBillingDate}</div>
                    <div className="text-[11px] text-zinc-500">Monto: {planPrice}</div>
                  </div>
                </div>

                {/* Registered Payment Method */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-3">
                  <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Método de Pago Predeterminado
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center font-black text-xs text-white">
                        VISA
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">Visa terminada en •••• 4242</div>
                        <div className="text-[11px] text-zinc-400">Vence: 12/28 · Titular: {athleteName}</div>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      Verificada
                    </span>
                  </div>
                </div>

                {/* Plan Guarantees & Terms */}
                <div className="space-y-2 text-xs text-zinc-400 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                  <div className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Términos y Flexibilidad de tu Membresía:</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-zinc-300">
                    <li>• Sin permanencia ni penalización. Puedes pausar o cancelar cuando lo desees.</li>
                    <li>• Las sesiones presenciales se coordinan mediante Google Calendar con el entrenador Giovanni Mérida.</li>
                    <li>• Incluye acceso ilimitado a las 4 semanas de rutinas y videoteca técnica.</li>
                  </ul>
                </div>
              </div>

              {/* Invoices and Receipts (5 cols) */}
              <div className="lg:col-span-5 bg-[#141414] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                  <Receipt className="w-4 h-4 text-[#E50914]" />
                  <h3 className="font-black text-sm text-white uppercase tracking-wider">
                    Historial de Recibos & Facturas
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Current Month Receipt */}
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-xs text-white">Membresía {planName} · Nov 2026</div>
                      <div className="text-[10px] text-zinc-400">Cobrado el 10 Nov 2026 · ID #TF-INV-9941</div>
                      <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Pagado exitosamente</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-sm text-white">{planPrice}</div>
                      <button
                        type="button"
                        onClick={() => alert(`Descargando comprobante fiscal de ${planPrice} (#TF-INV-9941)...`)}
                        className="text-[10px] text-zinc-400 hover:text-white inline-flex items-center gap-1 mt-1 font-bold cursor-pointer transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Recibo PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Scheduled Next Month Receipt */}
                  <div className="bg-zinc-950/50 p-3.5 rounded-xl border border-zinc-800/40 flex items-center justify-between gap-3 opacity-75">
                    <div>
                      <div className="font-bold text-xs text-zinc-300">Membresía {planName} · Dic 2026</div>
                      <div className="text-[10px] text-zinc-500">Programado: {nextBillingDate}</div>
                      <div className="text-[10px] text-amber-400 font-bold mt-0.5">Pendiente de cobro</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-sm text-zinc-400">{planPrice}</div>
                      <span className="text-[10px] text-zinc-500">Automático</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => alert('Para cambiar de tarjeta o cancelar membresía, contacta a amauryuchiha@gmail.com o a recepción.')}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-colors border border-zinc-800 cursor-pointer"
                  >
                    Gestionar Método de Pago
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATOS PERSONALES & CREDENCIAL OFICIAL */}
        {activeTab === 'perfil' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                Datos Personales del Atleta
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Verifica tus datos de contacto registrados y tu credencial digital de atleta activo.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form de Datos Personales (7 cols) */}
              <div className="lg:col-span-7 bg-[#141414] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-[#E50914]" />
                    <h3 className="font-black text-sm text-white uppercase tracking-wider">
                      Ficha de Atleta Titan Forge
                    </h3>
                  </div>

                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="text-xs font-bold text-[#E50914] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Datos</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                {profileSuccessMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Datos actualizados correctamente en el sistema.</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={athleteName}
                      onChange={(e) => setAthleteName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white disabled:opacity-75 focus:outline-none focus:border-[#E50914]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        disabled={!isEditingProfile}
                        value={athleteEmail}
                        onChange={(e) => setAthleteEmail(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white disabled:opacity-75 focus:outline-none focus:border-[#E50914]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="tel"
                        disabled={!isEditingProfile}
                        value={athletePhone}
                        onChange={(e) => setAthletePhone(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white disabled:opacity-75 focus:outline-none focus:border-[#E50914]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Objetivo Principal de Entrenamiento
                    </label>
                    <textarea
                      rows={2}
                      disabled={!isEditingProfile}
                      value={athleteGoal}
                      onChange={(e) => setAthleteGoal(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white disabled:opacity-75 focus:outline-none focus:border-[#E50914] resize-none"
                    />
                  </div>

                  {isEditingProfile && (
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="py-2.5 px-6 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Cambios</span>
                      </button>
                    </div>
                  )}
                </form>

                {/* Trainer Information Callout */}
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Entrenador y Coach Asignado</div>
                    <div className="font-bold text-white text-sm">Giovanni Mérida (Head Coach)</div>
                    <div className="text-xs text-zinc-400">Contacto técnico: {trainerEmail}</div>
                  </div>
                  <button
                    type="button"
                    onClick={onScrollToBooking}
                    className="text-xs font-bold text-[#E50914] hover:underline cursor-pointer"
                  >
                    Agendar Evaluación ↗
                  </button>
                </div>
              </div>

              {/* Official Credential Badge (5 cols) */}
              <div className="lg:col-span-5 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-zinc-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-44 h-44 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#E50914]" />
                    <span className="font-black text-xs sm:text-sm uppercase tracking-wider text-white">
                      Credencial Oficial de Atleta
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                    Membresía Activa
                  </span>
                </div>

                <div className="py-4 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Atleta:</span>
                    <span className="font-bold text-white">{athleteName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Correo Electrónico:</span>
                    <span className="text-zinc-300 truncate max-w-[200px]">{athleteEmail}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Plan Seleccionado:</span>
                    <span className="font-black text-[#E50914] uppercase">{planName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Modalidad:</span>
                    <span className="font-bold text-zinc-200">Suscripción Mensual ({planPrice}/mes)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Día de Cobro:</span>
                    <span className="font-bold text-zinc-300">Día {billingDay} de cada mes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">ID de Membresía:</span>
                    <span className="font-mono text-amber-400 font-bold tracking-wider">{membershipId}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 text-center font-montserrat">
                  Membresía emitida digitalmente por Titan Forge Athletics.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* POPUP / MODAL: VIDEO TÉCNICO DEMOSTRATIVO */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-3xl w-full p-5 sm:p-7 relative shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
              aria-label="Cerrar video"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Header */}
            <div className="pr-10">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#E50914] uppercase tracking-wider mb-1">
                <Play className="w-3 h-3 fill-current" />
                <span>Video Demostrativo & Guía Técnica</span>
              </div>
              <h3 className="font-black text-xl sm:text-2xl uppercase text-white">
                {activeVideoModal.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Supervisión técnica por el Coach Giovanni Mérida · {activeVideoModal.muscleGroup}
              </p>
            </div>

            {/* Video Player Frame */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-xl">
              {isDirectVideoFile(activeVideoModal.videoUrl) ? (
                <video
                  src={activeVideoModal.videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <iframe
                  src={activeVideoModal.videoUrl}
                  title={activeVideoModal.name}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Biomechanical Cues and Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Checklist Biomecánico</span>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {activeVideoModal.technicalTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#E50914] font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Errores Frecuentes a Evitar</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeVideoModal.commonMistakes}
                </p>
                <div className="pt-2 text-[11px] text-zinc-500">
                  Prescripción: <strong className="text-white">{activeVideoModal.setsReps}</strong> (Descanso: {activeVideoModal.rest})
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  toggleExerciseComplete(activeVideoModal.id);
                  setActiveVideoModal(null);
                }}
                className="py-2.5 px-5 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-red-600/30"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Marcar Ejercicio como Completado</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
