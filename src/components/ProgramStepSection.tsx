import React, { useState } from 'react';
import { X, Calendar, ArrowRight } from 'lucide-react';
import { ServiceItem } from '../data/landingData';
import fundationImg from '../../img/fundation.png';
import performanceImg from '../../img/performance.png';
import eliteImg from '../../img/elite.png';

interface ProgramStepSectionProps {
  onSelectPlanAndBook: (service: ServiceItem) => void;
  onEnrollPlan?: (plan: { level: 'principiante' | 'intermedio' | 'avanzado'; planName: string; price: string }) => void;
  services: ServiceItem[];
}

interface PlanWorkoutDetail {
  objective: string;
  duration: string;
  intensity: string;
  frequency: string;
  warmupTime: string;
  warmupExercises: { name: string; time: string }[];
  warmupNote: string;
  warmupWarning: string;
  volumeTime: string;
  volumeExercises: { name: string; reps: string }[];
}

const PLAN_WORKOUT_DETAILS: Record<string, PlanWorkoutDetail> = {
  principiante: {
    objective: 'desarrollar fuerza, potencia, resistencia anaeróbica y capacidad de trabajo mediante un estímulo híbrido de fuerza y acondicionamiento metabólico.',
    duration: '60–70 minutos.',
    intensity: 'alta, con esfuerzos vigorosos controlados.',
    frequency: '3–5 sesiones semanales, ajustadas a la experiencia, recuperación y carga total del atleta.',
    warmupTime: '12 minutos',
    warmupExercises: [
      { name: 'Carrera suave o remo ergómetro', time: '3 min' },
      { name: 'Movilidad dinámica de cadera, tobillos y columna torácica', time: '2 min' },
      { name: 'Sentadillas profundas controladas', time: '2 min' },
      { name: 'Zancadas dinámicas con rotación de tronco', time: '2 min' },
      { name: 'Skipping y desplazamientos laterales', time: '1 min' },
      { name: 'Saltos cortos de baja amplitud o pogos', time: '1 min' },
      { name: 'Aceleraciones progresivas', time: '1 min' },
    ],
    warmupNote: 'Preparar el sistema neuromuscular, aumentar la movilidad activa y ensayar progresivamente los patrones de movimiento que se utilizarán en la sesión.',
    warmupWarning: 'Importante: los saltos y las aceleraciones deben realizarse únicamente si existe experiencia previa y no hay dolor o limitaciones que comprometan la técnica.',
    volumeTime: '40–45 minutos',
    volumeExercises: [
      { name: 'Sentadilla con barra', reps: '5–6 reps' },
      { name: 'Press de banca', reps: '6–8 reps' },
      { name: 'Peso muerto rumano', reps: '6–8 reps' },
      { name: 'Saltos al cajón de altura apropiada', reps: '5 repeticiones' },
      { name: 'Lanzamientos de balón medicinal al suelo', reps: '8 repeticiones' },
      { name: 'Aceleración de 20 metros', reps: '2 repeticiones' },
    ],
  },
  intermedio: {
    objective: 'desarrollar hipertrofia muscular densa, fuerza submáxima y optimización del rendimiento atlético mediante sobrecarga progresiva y control estricto de RIR.',
    duration: '65–75 minutos.',
    intensity: 'alta, con volumen acumulado y RIR 1–2 controlado.',
    frequency: '4–5 sesiones semanales, distribuidas en bloques de tracción, empuje y pierna.',
    warmupTime: '12 minutos',
    warmupExercises: [
      { name: 'Carrera suave o remo dinámico', time: '3 min' },
      { name: 'Movilidad dinámica de cadera, escápulas y tobillos', time: '2 min' },
      { name: 'Sentadillas copa (Goblet Squat) con pausa isométrica', time: '2 min' },
      { name: 'Flexiones escapulares y aperturas con banda elástica', time: '2 min' },
      { name: 'Desplazamientos laterales y zancadas activas', time: '1 min' },
      { name: 'Saltos reactivos al cajón de altura media', time: '1 min' },
      { name: 'Aceleraciones progresivas y activación neural', time: '1 min' },
    ],
    warmupNote: 'Activar la musculatura estabilizadora, elevar la temperatura intramuscular y preparar los ángulos articulares específicos de la sesión.',
    warmupWarning: 'Importante: mantener la cadencia controlada y realizar series de aproximación con barra antes de las series efectivas.',
    volumeTime: '45–50 minutos',
    volumeExercises: [
      { name: 'Sentadilla trasera con barra', reps: '4 series x 6–8 reps' },
      { name: 'Press de banca plano con parada', reps: '4 series x 6–8 reps' },
      { name: 'Remo con barra con agarre prono', reps: '4 series x 8–10 reps' },
      { name: 'Peso muerto rumano con mancuernas', reps: '3 series x 8–10 reps' },
      { name: 'Press militar con mancuernas de pie', reps: '3 series x 10–12 reps' },
      { name: 'Aceleración de 25 metros con recuperación completa', reps: '3 repeticiones' },
    ],
  },
  avanzado: {
    objective: 'maximizar la fuerza absoluta, potencia explosiva, especificidad biomecánica y capacidad competitiva de alto nivel bajo periodización avanzada.',
    duration: '75–85 minutos.',
    intensity: 'muy alta, con esfuerzos submáximos y picos de potencia en RPE 8–10.',
    frequency: '5–6 sesiones semanales, calibradas según fatiga neuromuscular y tasa de recuperación del atleta.',
    warmupTime: '15 minutos',
    warmupExercises: [
      { name: 'Remo ergómetro con intervalos de potencia', time: '3 min' },
      { name: 'Protocolo de movilidad dinámica articular y torácica', time: '3 min' },
      { name: 'Activación glútea y cintura escapular con bandas', time: '2 min' },
      { name: 'Saltos verticales con contramovimiento (CMJ)', time: '2 min' },
      { name: 'Pliometría de choque o drop jumps controlados', time: '2 min' },
      { name: 'Lanzamientos rotacionales con balón medicinal pesado', time: '2 min' },
      { name: 'Sprints cortos de aceleración máxima', time: '1 min' },
    ],
    warmupNote: 'Potenciación post-activación (PAP), reclutamiento de unidades motoras de alto umbral y máxima reactividad tendinosa.',
    warmupWarning: 'Importante: exclusivo para atletas experimentados. Monitorear fatiga del SNC antes de cargar porcentajes cercanos al 1RM.',
    volumeTime: '50–55 minutos',
    volumeExercises: [
      { name: 'Sentadilla trasera pesada (85–90% 1RM)', reps: '5 series x 3–5 reps' },
      { name: 'Press de banca de competición con pausa', reps: '5 series x 3–5 reps' },
      { name: 'Peso muerto convencional / sumo pesado', reps: '4 series x 3–4 reps' },
      { name: 'Clean & Jerk o arrancada de potencia olímpica', reps: '4 series x 3 reps' },
      { name: 'Fondos en paralelas lastrados pesados', reps: '4 series x 6–8 reps' },
      { name: 'Aceleraciones resistidas de 20 metros con trineo', reps: '3 repeticiones' },
    ],
  },
};

export const ProgramStepSection: React.FC<ProgramStepSectionProps> = ({
  onSelectPlanAndBook,
  onEnrollPlan,
  services,
}) => {
  const [activePlanModal, setActivePlanModal] = useState<ServiceItem | null>(null);

  // Cards matching PDF Paso 2: FUNDATION, PERFORMANCE, ELITE
  const planCards = [
    {
      level: 'FUNDATION',
      image: fundationImg,
      service: services[0],
    },
    {
      level: 'PERFORMANCE',
      image: performanceImg,
      service: services[1] || services[0],
    },
    {
      level: 'ELITE',
      image: eliteImg,
      service: services[2] || services[0],
    },
  ];

  return (
    <section id="entrenamiento" className="w-full bg-[#ffffff] text-black py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Paso 2 Header with white background and black text as in PDF */}
        <div className="max-w-xl mb-12 sm:mb-16 space-y-3">
          <div className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#E50914] tracking-widest uppercase">
            PASO 2
          </div>
          <h2 className="font-montserrat font-black text-3xl sm:text-5xl lg:text-6xl text-black uppercase tracking-tight leading-[1.02]">
            RECIBE <br />
            TU PROGRAMA
          </h2>
          <p className="font-montserrat text-xs sm:text-[13px] text-[#444444] leading-relaxed pt-2">
            Nuestra calculadora determinará tu nivel y te mostrará uno de los tres planes de entrenamiento disponibles, con rutinas, series, repeticiones y recomendaciones específicas para ti.
          </p>
        </div>

        {/* 3 Athlete Cards with "VER PLAN" button in each card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {planCards.map((card) => {
            return (
              <div
                key={card.level}
                className="relative bg-black rounded-sm overflow-hidden h-[520px] sm:h-[620px] lg:h-[660px] flex flex-col justify-end group shadow-xl transition-all duration-300"
              >
                {/* Athlete photo matching original aspect ratio */}
                <img
                  src={card.image}
                  alt={card.level}
                  className="absolute inset-0 w-full h-full object-cover object-center filter contrast-110 brightness-95 group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Dark gradient overlay on bottom behind text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent pointer-events-none" />

                {/* Card Title & VER PLAN button from PDF */}
                <div className="relative z-10 p-6 text-center space-y-3">
                  <div className="font-montserrat font-black text-2xl sm:text-3xl text-white tracking-wider uppercase">
                    {card.level}
                  </div>

                  {/* VER PLAN button in popup as requested */}
                  <button
                    type="button"
                    onClick={() => setActivePlanModal(card.service)}
                    className="font-montserrat text-xs font-bold text-white uppercase tracking-widest bg-black/60 hover:bg-[#E50914] border border-white/60 hover:border-[#E50914] px-5 py-2 rounded-sm transition-all cursor-pointer backdrop-blur-sm"
                  >
                    VER PLAN
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VER PLAN Popup Modal */}
      {activePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#181818] border border-zinc-800 rounded-2xl max-w-lg sm:max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl space-y-5 text-white">
            <button
              onClick={() => setActivePlanModal(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Plan Title Header (No Price) */}
            <div>
              <div className="font-montserrat text-xs font-bold text-[#E50914] uppercase tracking-widest mb-1">
                Plan de Entrenamiento Titan Forge
              </div>
              <h3 className="font-montserrat text-2xl font-black uppercase text-white">
                {activePlanModal.title}
              </h3>
            </div>

            {/* Plan Details & Workout Structure matching Fundation layout */}
            {(() => {
              const details =
                PLAN_WORKOUT_DETAILS[activePlanModal.levelKey] ||
                PLAN_WORKOUT_DETAILS.principiante;

              return (
                <>
                  <div className="space-y-3 font-montserrat text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    <p>
                      <strong className="text-white">Objetivo:</strong> {details.objective}
                    </p>
                    <div className="space-y-1.5 text-xs text-zinc-300 bg-black/35 p-3 rounded-lg border border-zinc-800/80">
                      <p>
                        <strong className="text-white">Duración total:</strong> {details.duration}
                      </p>
                      <p>
                        <strong className="text-white">Intensidad:</strong> {details.intensity}
                      </p>
                      <p>
                        <strong className="text-white">Frecuencia recomendada:</strong> {details.frequency}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-3 border-t border-zinc-800">
                    <div className="font-montserrat text-xs font-black uppercase tracking-wider text-[#E50914]">
                      Entrenamiento
                    </div>

                    <div className="space-y-4 text-xs font-montserrat">
                      {/* Fase 1: Calentamiento */}
                      <div className="bg-black/35 border border-zinc-800/80 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                          <span className="font-bold text-white text-xs">Fase 1. Calentamiento</span>
                          <span className="text-[#E50914] font-bold text-[11px] bg-red-950/40 px-2 py-0.5 rounded border border-red-900/40">
                            {details.warmupTime}
                          </span>
                        </div>

                        <div className="space-y-2 pt-0.5">
                          {details.warmupExercises.map((item, idx) => (
                            <div key={idx} className="flex items-start justify-between gap-2 text-zinc-300">
                              <div className="flex items-start gap-2">
                                <ArrowRight className="w-3.5 h-3.5 text-[#E50914] shrink-0 mt-0.5" />
                                <span>{item.name}</span>
                              </div>
                              <span className="text-zinc-400 font-semibold text-[11px] shrink-0">{item.time}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 leading-relaxed space-y-1">
                          <p>{details.warmupNote}</p>
                          <p className="text-amber-300/90 font-medium">{details.warmupWarning}</p>
                        </div>
                      </div>

                      {/* Fase 2: Volumen de entrenamiento */}
                      <div className="bg-black/35 border border-zinc-800/80 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                          <span className="font-bold text-white text-xs">Fase 2. Volumen de entrenamiento</span>
                          <span className="text-[#E50914] font-bold text-[11px] bg-red-950/40 px-2 py-0.5 rounded border border-red-900/40">
                            {details.volumeTime}
                          </span>
                        </div>

                        <div className="space-y-2 pt-0.5">
                          {details.volumeExercises.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 text-zinc-300">
                              <div className="flex items-center gap-2">
                                <ArrowRight className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
                                <span>{item.name}</span>
                              </div>
                              <span className="text-zinc-400 font-semibold text-[11px] shrink-0">{item.reps}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Modal Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setActivePlanModal(null)}
                className="py-3 px-4 rounded-md border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase font-montserrat transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetPlan = activePlanModal;
                  setActivePlanModal(null);
                  if (onEnrollPlan) {
                    const planName =
                      targetPlan.levelKey === 'principiante'
                        ? 'Fundation'
                        : targetPlan.levelKey === 'intermedio'
                        ? 'Performance'
                        : 'Elite';
                    onEnrollPlan({
                      level: targetPlan.levelKey,
                      planName,
                      price: targetPlan.price,
                    });
                  } else {
                    onSelectPlanAndBook(targetPlan);
                  }
                }}
                className="flex-1 py-3 px-4 rounded-md bg-[#E50914] hover:bg-[#c90812] text-white text-xs font-black uppercase tracking-wider font-montserrat flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Inscribirme a plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
