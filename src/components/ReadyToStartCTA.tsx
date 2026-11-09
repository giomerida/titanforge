import logoTitanBlack from '../../img/logo titan black.png';

interface ReadyToStartCTAProps {
  onOpenCalculator: () => void;
}

export const ReadyToStartCTA: React.FC<ReadyToStartCTAProps> = ({
  onOpenCalculator,
}) => {
  return (
    <section className="w-full bg-[#ffffff] text-black py-12 sm:py-16 border-t border-[#e5e5e5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main CTA Row: Spartan logo + "¿LISTO PARA EMPEZAR?" + Red Button with arrow */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-10 border-b border-[#e0e0e0]">
          {/* Logo & Headline from PDF */}
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 flex items-center justify-center relative shrink-0">
              <img
                src={logoTitanBlack}
                alt="Titan Forge Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
            <div>
              <h2 className="font-montserrat font-black text-2xl sm:text-3xl text-[#E50914] uppercase tracking-tight leading-tight">
                ¿LISTO PARA EMPEZAR?
              </h2>
              <p className="font-montserrat text-xs sm:text-[13px] font-semibold text-[#111111] mt-0.5">
                Tu objetivo esta a un clic de distancia
              </p>
            </div>
          </div>

          {/* Red Button with Arrow as in PDF Footer */}
          <div>
            <button
              type="button"
              onClick={onOpenCalculator}
              className="inline-flex items-center gap-3 bg-[#E50914] hover:bg-[#c90812] text-white font-montserrat font-bold text-xs sm:text-sm uppercase tracking-wider px-7 py-3.5 rounded-md shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Calcula tu entrenamiento</span>
              <span className="text-base font-black">↗</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation Bar exactly as bottom of PDF: Inicio | Entrenamiento | Calculadora | Sobre Titan Forge | Contacto */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs sm:text-[13px] font-montserrat font-semibold text-[#1a1a1a]">
          <a href="#" className="hover:text-[#E50914] transition-colors">
            Inicio
          </a>
          <span className="text-zinc-300">|</span>
          <a href="#entrenamiento" className="hover:text-[#E50914] transition-colors">
            Entrenamiento
          </a>
          <span className="text-zinc-300">|</span>
          <button
            type="button"
            onClick={onOpenCalculator}
            className="hover:text-[#E50914] font-semibold transition-colors cursor-pointer"
          >
            Calculadora
          </button>
          <span className="text-zinc-300">|</span>
          <a href="#sobre-titan-forge" className="hover:text-[#E50914] transition-colors">
            Sobre Titan Forge
          </a>
        </div>
      </div>
    </section>
  );
};
