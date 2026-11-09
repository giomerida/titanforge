import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { LogOut } from 'lucide-react';

import logoTitanBlack from '../../img/logo titan black.png';
import logoTitanForge from '../../img/logo titan forge.png';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onOpenCalculator: () => void;
  onScrollToBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenCalculator,
  onScrollToBooking,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle logo visibility when scrolled past 60px
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 w-full bg-[#ffffff] border-b border-zinc-200 z-50 transition-shadow duration-300 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between relative">
        {/* Left: Logo Container */}
        <div className="relative flex items-center min-w-[120px] sm:min-w-[150px] h-full">
          {/* Logo actual en el menú (logo titan black.png): Oculto arriba, visible al bajar */}
          <a
            href="#"
            className={`flex items-center py-1 transition-all duration-300 ease-in-out ${
              isScrolled
                ? 'opacity-100 scale-100 pointer-events-auto translate-y-0'
                : 'opacity-0 scale-90 pointer-events-none -translate-y-2'
            }`}
            aria-label="Titan Forge Inicio"
          >
            <img
              src={logoTitanBlack}
              alt="Titan Forge Logo"
              className="h-14 sm:h-16 w-auto object-contain transition-transform duration-200 hover:scale-105"
            />
          </a>

          {/* Logo flotante (logo titan forge.png): tamaño ajustado para visibilidad completa entre menú y header */}
          <div
            className={`absolute left-0 top-full -translate-y-1/2 z-50 transition-all duration-300 ease-out origin-top-left ${
              !isScrolled
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-75 pointer-events-none -translate-y-3/4'
            }`}
          >
            <a href="#" aria-label="Titan Forge Inicio" className="block group">
              <img
                src={logoTitanForge}
                alt="Titan Forge Logo Flotante"
                className="h-28 sm:h-32 md:h-36 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.65)] group-hover:scale-105 transition-transform duration-300"
              />
            </a>
          </div>
        </div>

        {/* Center Navigation Menu from PDF: Inicio | Entrenamiento | Calculadora | Sobre Titan Forge | Contacto */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[13px] font-montserrat font-semibold text-[#1a1a1a]">
          <a
            href="#"
            className="text-[#E50914] border-b-2 border-[#E50914] pb-0.5 font-bold transition-colors"
          >
            Inicio
          </a>
          <a
            href="#entrenamiento"
            className="hover:text-[#E50914] transition-colors"
          >
            Entrenamiento
          </a>
          {/* Calculadora triggers Popup */}
          <button
            type="button"
            onClick={onOpenCalculator}
            className="hover:text-[#E50914] transition-colors font-semibold cursor-pointer"
          >
            Calculadora
          </button>
          <a
            href="#sobre-titan-forge"
            className="hover:text-[#E50914] transition-colors"
          >
            Sobre Titan Forge
          </a>
        </nav>

        {/* Right CTA Button: Comienza ahora with arrow in PDF */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden sm:flex items-center gap-2 bg-white border border-zinc-300 py-1 px-2.5 rounded-md text-xs">
              <span className="font-bold text-zinc-800 truncate max-w-[90px]">
                {user.displayName || 'Coach'}
              </span>
              <button
                onClick={onLogout}
                className="text-zinc-500 hover:text-red-600 p-0.5"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}

          {/* Red Pill Button exactly as top right of PDF */}
          <button
            type="button"
            onClick={onScrollToBooking}
            className="bg-[#E50914] hover:bg-[#c90812] text-white font-montserrat font-bold text-xs sm:text-[13px] px-4 sm:px-5 py-2.5 rounded-md transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Comienza ahora</span>
            <span className="font-black text-sm">↗</span>
          </button>
        </div>
      </div>
    </header>
  );
};
