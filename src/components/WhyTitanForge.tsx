import React from 'react';
import fondoElegir from '../../img/fondo_elegir.png';

export const WhyTitanForge: React.FC = () => {
  const pillars = [
    {
      title: 'Plan a tu medida entrena a tu ritmo',
      desc: 'Entrena según tus condiciones reales',
    },
    {
      title: 'Resultados Medibles',
      desc: '',
    },
    {
      title: 'Coach de respaldo',
      desc: 'Te acompañamos en cada etapa.',
    },
    {
      title: 'Sin Límites',
      desc: 'Tu mejor versión empieza hoy.',
    },
  ];

  return (
    <section id="sobre-titan-forge" className="relative w-full bg-[#111111] text-white py-16 sm:py-24 border-t border-[#222222] overflow-hidden">
      {/* Background image: fondo_elegir.png */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={fondoElegir}
          alt="Fondo ¿Por qué elegir a Titan Forge?"
          className="w-full h-full object-cover object-right md:object-center filter contrast-110 brightness-95"
        />
        {/* Dark gradient overlay so the headline and pillars are ultra-readable while highlighting the athlete */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 to-black/35" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Top Split: Question & Red Headline (Left) vs Coach Quote (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-16">
          {/* Left: ¿POR QUÉ ELEGIR A TITAN FORGE? + MÁS QUE UN ENTRENAMIENTO ES FORJAR EL CARÁCTER. */}
          <div className="md:col-span-7 space-y-3">
            <div className="font-montserrat font-bold text-xs sm:text-sm text-white tracking-wider uppercase">
              ¿POR QUÉ ELEGIR A TITAN FORGE?
            </div>
            <h2 className="font-montserrat font-black text-2xl sm:text-4xl lg:text-[42px] text-[#E50914] uppercase tracking-tight leading-[1.08] drop-shadow-md">
              MÁS QUE UN ENTRENAMIENTO <br />
              ES FORJAR EL CARÁCTER.
            </h2>
          </div>

          {/* Right: Quote exactly as in PDF matching the coach photo in the background */}
          <div className="md:col-span-5 flex items-center justify-start md:justify-end">
            <div className="space-y-2 bg-black/40 md:bg-black/20 backdrop-blur-xs p-4 sm:p-5 rounded-lg border border-white/10 md:border-transparent text-left md:text-right max-w-md">
              <div className="font-montserrat font-black text-xs sm:text-[14px] text-white uppercase leading-snug tracking-wide drop-shadow-lg">
                EL VERDADERO PROGRESO <br />
                NO VIENE DE LA CASUALIDAD <br />
                SINO DE UN PLAN
              </div>
              <div className="font-montserrat font-bold text-xs text-[#E50914] uppercase tracking-widest drop-shadow-md">
                TITAN FORGE
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: 4 Column Cards with vertical hairline borders as in PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-white/20">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className="space-y-2 border-l border-white/30 pl-4 sm:pl-5 bg-black/25 backdrop-blur-xs py-2 rounded-r-sm"
            >
              <h3 className="font-montserrat font-black text-base sm:text-lg text-white leading-tight drop-shadow-md">
                {item.title}
              </h3>
              {item.desc ? (
                <p className="font-montserrat text-xs text-[#cccccc] leading-relaxed drop-shadow-sm">
                  {item.desc}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
