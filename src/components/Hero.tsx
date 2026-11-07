import fondoHeader from '../../img/fondo_header.png';

interface HeroProps {
  onOpenCalculator: () => void;
  onScrollToBooking?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCalculator }) => {
  return (
    <section className="relative w-full bg-[#111111] overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
      {/* Background athlete image anchored to the top to show full head and background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={fondoHeader}
          alt="Fondo Atleta Titan Forge"
          className="w-full h-full object-cover object-[85%_top] sm:object-[80%_top] md:object-[right_top] filter contrast-110 brightness-95"
        />
        {/* Soft gradient from left to ensure text legibility while keeping the athlete crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="space-y-6 max-w-3xl">
          {/* Main Heading */}
          <h1 className="font-montserrat font-black text-3xl sm:text-5xl lg:text-[56px] text-white leading-[1.05] tracking-tight uppercase">
            ENTRENAMIENTO <br />
            PERSONALIZADO <br />
            A TU MEDIDA.
          </h1>

          {/* Description */}
          <p className="font-montserrat text-xs sm:text-[14px] text-[#cccccc] max-w-lg leading-relaxed font-normal">
            En Titan Forge diseñamos tu plan de entrenamiento con base en tu edad, sexo, condición física y objetivos. Completa nuestra calculadora y recibe tu programa personalizado en minutos.
          </p>
        </div>

        {/* Button "Calcula tu entrenamiento" */}
        <div className="pt-8">
          <button
            type="button"
            onClick={onOpenCalculator}
            className="inline-flex items-center gap-3 bg-[#E50914] hover:bg-[#c90812] text-white font-montserrat font-bold text-xs sm:text-sm uppercase tracking-wide px-7 py-3.5 rounded-md shadow-lg shadow-red-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Calcula tu entrenamiento</span>
            <span className="text-base font-black">↗</span>
          </button>
        </div>
      </div>
    </section>
  );
};
