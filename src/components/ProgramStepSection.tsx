import React, { useState } from 'react';
import { X, Check, Calendar, ArrowRight } from 'lucide-react';
import { ServiceItem } from '../data/landingData';
import fundationImg from '../../img/fundation.png';
import performanceImg from '../../img/performance.png';
import eliteImg from '../../img/elite.png';

interface ProgramStepSectionProps {
  onSelectPlanAndBook: (service: ServiceItem) => void;
  services: ServiceItem[];
}

export const ProgramStepSection: React.FC<ProgramStepSectionProps> = ({
  onSelectPlanAndBook,
  services,
}) => {
  const [activePlanModal, setActivePlanModal] = useState<ServiceItem | null>(null);

  // Cards exactly matching PDF Paso 2: FUNDATION, PERFORMANCE, ELITE
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

                  <div>
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
              </div>
            );
          })}
        </div>
      </div>

      {/* VER PLAN Popup Modal */}
      {activePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#181818] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-6 text-white">
            <button
              onClick={() => setActivePlanModal(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="font-montserrat text-xs font-bold text-[#E50914] uppercase tracking-widest mb-1">
                Plan de Entrenamiento Titan Forge
              </div>
              <h3 className="font-montserrat text-2xl font-black uppercase text-white">
                {activePlanModal.title}
              </h3>
              <div className="font-montserrat text-2xl font-black text-[#E50914] mt-2">
                {activePlanModal.price}{' '}
                <span className="text-xs text-zinc-400 font-normal">/ sesión personalizada</span>
              </div>
            </div>

            <p className="font-montserrat text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {activePlanModal.description}
            </p>

            <div className="space-y-2.5 pt-2 border-t border-zinc-800">
              <div className="font-montserrat text-xs font-bold uppercase tracking-wider text-zinc-400">
                Detalles del programa:
              </div>
              {activePlanModal.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setActivePlanModal(null)}
                className="py-3 px-4 rounded-md border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase font-montserrat transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectPlanAndBook(activePlanModal);
                  setActivePlanModal(null);
                }}
                className="flex-1 py-3 px-4 rounded-md bg-[#E50914] hover:bg-[#c90812] text-white text-xs font-black uppercase tracking-wider font-montserrat flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Este Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
