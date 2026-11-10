import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { LogOut, User as UserIcon, Shield, ChevronRight, Lock } from 'lucide-react';

import logoTitanBlack from '../../img/logo titan black.png';
import logoTitanForge from '../../img/logo titan forge.png';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onOpenCalculator: () => void;
  onScrollToBooking: () => void;
  trainerEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  onOpenCalculator,
  onScrollToBooking,
  trainerEmail,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

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

        {/* Center Navigation Menu: Inicio | Entrenamiento | Calculadora | Sobre Titan Forge */}
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
          {/* Calculadora triggers scroll to calculator */}
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

        {/* Right CTA Button: Comienza ahora + Icono de Perfil para Usuarios y Administrador */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Red Pill Button exactly as top right of PDF */}
          <button
            type="button"
            onClick={onScrollToBooking}
            className="bg-[#E50914] hover:bg-[#c90812] text-white font-montserrat font-bold text-xs sm:text-[13px] px-4 sm:px-5 py-2.5 rounded-md transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            <span>Comienza ahora</span>
            <span className="font-black text-sm">↗</span>
          </button>

          {/* Profile Icon for Users & Administrator */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center relative cursor-pointer ${
                isProfileOpen
                  ? 'border-[#E50914] ring-2 ring-red-500/20 bg-red-50/50 text-[#E50914]'
                  : 'border-zinc-300 hover:border-black bg-white hover:bg-zinc-50 text-zinc-700 hover:text-black shadow-xs'
              }`}
              aria-label="Perfil de usuario y administrador"
              title={user ? `Conectado: ${user.displayName || user.email}` : 'Acceso de usuarios y administrador'}
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : user ? (
                <div className="w-full h-full rounded-full bg-zinc-900 text-white font-black text-xs flex items-center justify-center uppercase">
                  {(user.displayName || user.email || 'U')[0]}
                </div>
              ) : (
                <UserIcon className="w-5 h-5 text-zinc-700" />
              )}

              {/* Status dot if logged in */}
              {user && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
              )}
            </button>

            {/* Profile & Login Dropdown Panel */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-200/90 z-50 p-4 text-zinc-900 animate-fadeIn">
                {user ? (
                  /* Logged-in Profile View */
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'Usuario'}
                          className="w-12 h-12 rounded-full object-cover border border-zinc-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-900 text-white font-black text-base flex items-center justify-center uppercase shrink-0">
                          {(user.displayName || user.email || 'U')[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-montserrat font-bold text-sm text-zinc-900 truncate">
                          {user.displayName || 'Usuario Titan'}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">{user.email}</div>
                        <div className="mt-1">
                          {user.email?.toLowerCase() === trainerEmail?.toLowerCase() ? (
                            <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-800 border border-amber-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                              ⚡ Administrador / Coach
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                              🏋️ Atleta Titan Forge
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick navigation actions */}
                    <div className="space-y-1 text-xs font-montserrat font-semibold text-zinc-700">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onScrollToBooking();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-left"
                      >
                        <span>📅 Mis Reservas & Sesiones</span>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onOpenCalculator();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer text-left"
                      >
                        <span>🧮 Mi Calculadora & Nivel</span>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-100 hover:bg-red-50 hover:text-red-600 text-zinc-700 text-xs font-montserrat font-bold transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Not Logged In - Login Panel */
                  <div className="space-y-4">
                    <div className="text-center pb-2 border-b border-zinc-100">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 mx-auto flex items-center justify-center mb-2">
                        <Lock className="w-5 h-5 text-[#E50914]" />
                      </div>
                      <h4 className="font-montserrat font-black text-sm text-zinc-900 uppercase">
                        Ingreso al Sistema
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Exclusivo para personas con planes y administración
                      </p>
                    </div>

                    {/* Google OAuth Login Button */}
                    <div>
                      <button
                        type="button"
                        disabled={isLoggingIn}
                        onClick={async () => {
                          await onLogin();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 text-zinc-800 font-montserrat font-bold text-xs py-3 px-4 rounded-xl border border-zinc-300 shadow-sm transition-all hover:border-zinc-400 active:scale-98 cursor-pointer disabled:opacity-50"
                      >
                        {/* Official Google SVG icon */}
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>{isLoggingIn ? 'Conectando...' : 'Ingresar con Google'}</span>
                      </button>
                    </div>

                    <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/25 text-[11px] text-zinc-700 space-y-1">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#E50914]" />
                        <span>Acceso Exclusivo:</span>
                      </div>
                      <p className="leading-relaxed text-zinc-600">
                        Acceso reservado únicamente para atletas con un <strong className="text-zinc-900">plan activo</strong> (Fundation, Performance o Elite) y administración.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
