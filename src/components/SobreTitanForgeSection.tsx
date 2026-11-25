import React from 'react';
import { Hero } from './Hero';
import { WhyTitanForge } from './WhyTitanForge';

interface SobreTitanForgeSectionProps {
  onOpenCalculator: () => void;
  onScrollToBooking: () => void;
}

const FEATURE_ITEMS = [
  {
    titleLines: ['Plan a tu medida', 'entrena a tu ritmo'],
    descLines: ['Entrena según', 'tus condiciones reales'],
  },
  {
    titleLines: ['Resultados', 'Medibles'],
    descLines: [],
  },
  {
    titleLines: ['Coach', 'de respaldo'],
    descLines: ['Te acompañamos', 'en cada etapa.'],
  },
  {
    titleLines: ['Sin Límites'],
    descLines: ['Tu mejor versión', 'empieza hoy.'],
  },
];

const FOUR_PILLARS = [
  {
    number: '01.',
    title: 'Evaluación individual',
    description:
      'Identificamos las características iniciales del usuario para orientar la selección de su programa.',
  },
  {
    number: '02.',
    title: 'Entrenamiento estructurado',
    description:
      'Organizamos ejercicios, volumen, intensidad y frecuencia de acuerdo con el nivel y los objetivos.',
  },
  {
    number: '03.',
    title: 'Progresión planificada',
    description:
      'El entrenamiento evoluciona conforme mejoran la capacidad de trabajo, la técnica y la tolerancia al esfuerzo.',
  },
  {
    number: '04.',
    title: 'Seguimiento y adaptación',
    description:
      'La evaluación periódica permite ajustar el programa según los avances, las necesidades y las limitaciones identificadas.',
  },
];

const BoldArrowUpRight: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`inline-block shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M5 19L17.5 6.5M17.5 6.5H7.5M17.5 6.5V16.5"
      stroke="currentColor"
      strokeWidth="3.8"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

export const SobreTitanForgeSection: React.FC<SobreTitanForgeSectionProps> = ({
  onOpenCalculator,
  onScrollToBooking,
}) => {
  return (
    <div id="sobre-titanforge" className="w-full bg-[#111111]">
      {/* Header actual (Hero) */}
      <Hero
        onOpenCalculator={onOpenCalculator}
        onScrollToBooking={onScrollToBooking}
      />

      {/* Sección separada: Barra negra con CTA y pilares clave */}
      <section className="w-full bg-black text-white py-10 sm:py-12 lg:py-14 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10">
          {/* Botón CTA Rojo estilo píldora */}
          <div className="shrink-0 w-full sm:w-auto flex justify-center lg:justify-start">
            <button
              type="button"
              onClick={onOpenCalculator}
              className="inline-flex items-center justify-center gap-4 bg-[#E50914] hover:bg-[#c90812] text-white font-montserrat font-semibold text-base sm:text-lg px-7 sm:px-9 py-4 rounded-full shadow-lg shadow-red-600/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Calcula tu entrenamiento</span>
              <BoldArrowUpRight className="w-6 h-6" />
            </button>
          </div>

          {/* 4 Columnas de información separadas por líneas verticales rojas */}
          <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-stretch gap-6 lg:gap-0">
            {FEATURE_ITEMS.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div
                    className="hidden lg:block w-[2px] bg-[#E50914] self-stretch mx-6 xl:mx-8 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <div className="flex flex-col justify-center border-l-2 border-[#E50914] pl-4 lg:border-l-0 lg:pl-0 py-1 min-w-[140px]">
                  <h3 className="font-montserrat font-bold text-base sm:text-[17px] text-white leading-snug tracking-tight">
                    {item.titleLines.map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < item.titleLines.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </h3>
                  {item.descLines.length > 0 && (
                    <p className="font-montserrat text-xs sm:text-[13px] text-zinc-200 leading-snug mt-2.5 font-normal">
                      {item.descLines.map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < item.descLines.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Sección Editorial: Filosofía, Método Titan Forge y Los 4 Pilares */}
      <section className="w-full bg-white text-[#111111] py-16 sm:py-24 font-montserrat">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bloque 1: Forjar el cuerpo, Desarrollar el potencial */}
          <div className="space-y-6 max-w-4xl">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-normal tracking-tight text-black leading-tight flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span>Forjar el cuerpo,</span>
              <span className="font-bold">Desarrollar el potencial</span>
              <BoldArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8 text-black ml-1" />
            </h2>

            <div className="space-y-4 text-sm sm:text-[15px] text-zinc-900 leading-relaxed max-w-2xl pt-2">
              <p>
                Titan Forge nace de una idea: el rendimiento no se improvisa, se construye.
              </p>
              <p>
                Cada entrenamiento representa una oportunidad para desarrollar fuerza, mejorar
                capacidades y superar progresivamente los límites propios.
              </p>
              <p>
                Creemos en la disciplina como hábito, en la planificación como herramienta y en la
                progresión como principio fundamental del acondicionamiento físico.
              </p>
              <p>
                No importa dónde comienza tu proceso. Lo importante es contar con una dirección y
                un método para avanzar.
              </p>
            </div>

            <p className="pt-4 font-black italic uppercase tracking-wide text-sm sm:text-base text-zinc-800">
              TITAN FORGE. BUILT THROUGH DISCIPLINE.
            </p>
          </div>

          {/* Línea divisora horizontal */}
          <hr className="my-10 sm:my-12 border-0 h-px bg-zinc-800" />

          {/* Bloque 2: Método Titan Forge y Los 4 Pilares */}
          <div className="space-y-8 max-w-4xl">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-black leading-tight flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span>Método</span>
                <span className="font-bold">Titan Forge</span>
                <BoldArrowUpRight className="w-6 h-6 sm:w-7 sm:h-7 text-black ml-1" />
              </h2>

              <p className="text-base sm:text-xl font-normal text-zinc-900">
                No todos entrenamos igual, no todos necesitamos lo mismo.
              </p>
            </div>

            <div className="space-y-4 text-sm sm:text-[15px] text-zinc-900 leading-relaxed max-w-3xl">
              <p>
                Tu edad, experiencia, condición física y objetivos determinan la forma en que debes
                entrenar. En Titan Forge utilizamos estos factores para orientar la selección de tu
                programa, establecer un punto de partida y ayudarte a desarrollar tus capacidades
                físicas mediante una progresión estructurada.
              </p>
              <p>
                No se trata de entrenar más por entrenar. Se trata de entrenar con intención.
              </p>
            </div>

            {/* Subsección: Los 4 pilares de Titan Forge */}
            <div className="pt-2 space-y-6">
              <h3 className="text-2xl sm:text-[28px] font-normal tracking-tight text-black leading-tight flex flex-wrap items-center gap-x-2">
                <span>Los 4 pilares de</span>
                <span className="font-bold">Titan Forge.</span>
                <BoldArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-black ml-0.5" />
              </h3>

              <div className="space-y-5">
                {FOUR_PILLARS.map((pillar) => (
                  <div key={pillar.number} className="space-y-0.5">
                    <h4 className="font-bold text-sm sm:text-[15px] text-black">
                      {pillar.number} {pillar.title}
                    </h4>
                    <p className="text-sm sm:text-[15px] text-zinc-900 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: ¿Por qué elegir a Titan Forge? */}
      <WhyTitanForge />
    </div>
  );
};
