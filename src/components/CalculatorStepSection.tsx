import React from 'react';
import { Calculator } from 'lucide-react';
import fondoPaso1 from '../../img/fondo_paso1.png';

interface CalculatorStepSectionProps {
  onOpenCalculator: () => void;
}

export const CalculatorStepSection: React.FC<CalculatorStepSectionProps> = ({
  onOpenCalculator,
}) => {
  return (
    <section id="calculadora" className="w-full bg-[#111111] text-white py-14 sm:py-20 relative overflow-hidden">
      {/* Background athlete photo without opacity reduction */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={fondoPaso1}
          alt="Fondo Paso 1 Titan Forge"
          className="w-full h-full object-cover object-center filter contrast-110 brightness-95"
        />
        {/* Soft gradient from left to ensure text legibility while keeping the image crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: PASO 1 + USA NUESTRA CALCULADORA. + STRENGTH */}
          <div className="md:col-span-6 space-y-4 relative z-10">
            {/* Step label in dark orange/red - 2x larger */}
            <div className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#E50914] tracking-widest uppercase">
              PASO 1
            </div>

            {/* Main Heading in Montserrat Bold/Black */}
            <h2 className="font-montserrat font-black text-3xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-[1.02]">
              USA NUESTRA <br />
              CALCULADORA.
            </h2>

            {/* Description matching PDF */}
            <p className="font-montserrat text-xs sm:text-[13px] text-[#a0a0a0] max-w-md leading-relaxed pt-1">
              Ingresa tus datos y cuéntanos sobre tus objetivos. En segundos, obtendrás tu nivel de entrenamiento y un plan diseñado para ti.
            </p>

            {/* Giant STRENGTH text positioned under heading/athlete exactly as in PDF */}
            <div className="pt-8 select-none pointer-events-none">
              <span className="font-montserrat font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tighter uppercase">
                STRENGTH
              </span>
            </div>
          </div>

          {/* Right Column: Amplified "Calcula Aquí" Red Block */}
          <div className="md:col-span-6 relative flex justify-center md:justify-end">
            <div
              onClick={onOpenCalculator}
              title="Hacer clic para abrir la calculadora"
              className="w-full max-w-md bg-[#E50914] hover:bg-[#c90812] transition-all duration-300 rounded-sm cursor-pointer min-h-[340px] sm:min-h-[420px] flex flex-col items-center justify-center p-8 sm:p-12 text-center shadow-2xl group border border-red-500/30 transform hover:-translate-y-1 active:translate-y-0"
            >
              <div className="w-14 h-14 rounded-full bg-black/20 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                <Calculator className="w-7 h-7" />
              </div>

              <div className="font-montserrat font-black text-2xl sm:text-4xl text-white uppercase tracking-wider leading-tight group-hover:scale-105 transition-transform">
                CALCULA <br />
                AQUÍ ↗
              </div>

              <div className="font-montserrat text-xs sm:text-sm text-white/95 uppercase tracking-widest mt-4 font-bold bg-black/20 px-4 py-1.5 rounded-full">
                (IMC & Nivel de Entrenamiento)
              </div>

              <p className="font-montserrat text-xs text-white/80 mt-4 max-w-xs leading-relaxed hidden sm:block">
                Haz clic para abrir la calculadora interactiva y recibir tu plan personalizado al instante.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
