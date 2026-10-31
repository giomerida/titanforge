import fondoHeader from '../../img/fondo_header.png';

interface HeroProps {
  onOpenCalculator: () => void;
  onScrollToBooking?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCalculator }) => {
  return (
    <section className="relative w-full bg-[#111111] overflow-hidden pt-16 sm:pt-24 pb-16 sm:pb-24">
      {/* Background athlete image without opacity reduction */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={fondoHeader}
          alt="Fondo Atleta Titan Forge"
          className="w-full h-full object-cover object-right md:object-center filter contrast-110 brightness-95"
        />
        {/* Soft gradient from left to ensure text legibility while keeping the image crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
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

        {/* Row with "Calcula tu entrenamiento" button on the left and "STRONGER" aligned on the same horizontal level */}
        <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Red button with white arrow */}
          <div>
            <button
              type="button"
              onClick={onOpenCalculator}
              className="inline-flex items-center gap-3 bg-[#E50914] hover:bg-[#c90812] text-white font-montserrat font-bold text-xs sm:text-sm uppercase tracking-wide px-7 py-3.5 rounded-md shadow-lg shadow-red-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Calcula tu entrenamiento</span>
              <span className="text-base font-black">↗</span>
            </button>
          </div>

          {/* STRONGER text in pure white aligned with the button */}
          <div className="select-none pointer-events-none self-start md:self-center">
            <span className="font-montserrat font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tighter uppercase drop-shadow-2xl leading-none block">
              STRONGER
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
