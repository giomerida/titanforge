import React from 'react';
import { Target, Activity, HeartPulse, Dumbbell, ArrowRight } from 'lucide-react';

interface MethodologyProps {
  onSelectService: (serviceId: string) => void;
}

export const Methodology: React.FC<MethodologyProps> = ({ onSelectService }) => {
  const steps = [
    {
      number: '01',
      title: 'Diagnóstico & Análisis Biomecánico',
      desc: 'Evaluamos patrones de movimiento, limitaciones de movilidad articular, historial de lesiones y objetivos específicos antes de prescribir un solo levantamiento.',
      icon: Target,
    },
    {
      number: '02',
      title: 'Periodización & Sobrecarga Inteligente',
      desc: 'Diseñamos un plan por mesociclos con RIR/RPE controlado. Nada queda al azar; cada repetición y cada serie tiene un propósito biomecánico claro.',
      icon: Dumbbell,
    },
    {
      number: '03',
      title: 'Nutrición & Optimización Metabólica',
      desc: 'Ajustamos requerimientos de macronutrientes y gasto energético para asegurar que la recuperación tisular acompañe la intensidad de tu esfuerzo.',
      icon: HeartPulse,
    },
    {
      number: '04',
      title: 'Monitoreo Semanal & Ajuste de Cargas',
      desc: 'Revisión técnica periódica con videoanálisis, control de fatiga acumulada y recalibración de cargas para evitar estancamientos y lesiones.',
      icon: Activity,
    },
  ];

  return (
    <section id="metodologia" className="py-20 md:py-28 bg-zinc-950/60 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <div className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-amber-400 mb-2">
            El Método
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">
            No es suerte ni genética extrema. Es ingeniería aplicada a tu cuerpo.
          </h2>
          <p className="text-zinc-400 mt-4 text-base sm:text-lg leading-relaxed">
            Eliminamos la improvisación de los gimnasios tradicionales mediante un sistema progresivo que prioriza la longevidad articular y resultados visibles desde el primer mes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group p-6 sm:p-7 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-amber-500/40 transition-all duration-300 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display font-black text-2xl sm:text-3xl text-zinc-600 group-hover:text-amber-400 transition-colors">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-amber-500/20 text-zinc-300 group-hover:text-amber-400 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-amber-200 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
