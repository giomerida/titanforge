import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CalculatorStepSection } from './components/CalculatorStepSection';
import { ProgramStepSection } from './components/ProgramStepSection';
import { WhyTitanForge } from './components/WhyTitanForge';
import { BookingSection } from './components/BookingSection';
import { Contact } from './components/Contact';
import { ReadyToStartCTA } from './components/ReadyToStartCTA';
import { BMICalculatorModal } from './components/BMICalculatorModal';
import { SERVICES_DATA, ServiceItem } from './data/landingData';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem>(SERVICES_DATA[1]); // Default to Intermedio
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Trainer's email account for notifications & calendars
  const TRAINER_EMAIL = 'amauryuchiha@gmail.com';

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        // user signed out or initial
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const scrollToBooking = () => {
    const el = document.getElementById('reservas');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPlanAndBook = (serviceOrLevel: ServiceItem | 'principiante' | 'intermedio' | 'avanzado') => {
    if (typeof serviceOrLevel === 'string') {
      const matched = SERVICES_DATA.find((s) => s.levelKey === serviceOrLevel) || SERVICES_DATA[1];
      setSelectedService(matched);
    } else {
      setSelectedService(serviceOrLevel);
    }
    scrollToBooking();
  };

  const scrollToCalculator = () => {
    const el = document.getElementById('calculadora');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Fixed Header with Titan Forge Logo & Menu */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        onScrollToBooking={scrollToBooking}
        onOpenCalculator={scrollToCalculator}
        trainerEmail={TRAINER_EMAIL}
      />

      {/* Main Content Sections strictly reflecting the shared PDF Design */}
      <main className="flex-1">
        {/* 1. HERO: "ENTRENAMIENTO PERSONALIZADO A TU MEDIDA" */}
        <Hero
          onOpenCalculator={scrollToCalculator}
          onScrollToBooking={scrollToBooking}
        />

        {/* Separador: Barra negra 5 veces más grande y sin contornos */}
        <div className="w-full h-16 sm:h-20 bg-black" />

        {/* 2. PASO 1: "USA NUESTRA CALCULADORA" + Calculadora Interactiva en bloque rojo */}
        <CalculatorStepSection
          onSelectPlanAndBook={handleSelectPlanAndBook}
          onOpenCalculator={scrollToCalculator}
        />

        {/* 3. PASO 2: "RECIBE TU PROGRAMA" - FUNDATION, PERFORMANCE, ELITE with VER PLAN popup */}
        <ProgramStepSection
          services={SERVICES_DATA}
          onSelectPlanAndBook={handleSelectPlanAndBook}
        />

        {/* 4. ¿POR QUÉ ELEGIR A TITAN FORGE? + "MÁS QUE UN ENTRENAMIENTO ES FORJAR EL CARÁCTER" */}
        <WhyTitanForge />

        {/* 5. Agendamiento Online con Google Calendar y Gmail (Sesión personalizada) */}
        <BookingSection
          user={user}
          onLogin={handleLogin}
          selectedService={selectedService}
          onServiceChange={setSelectedService}
          trainerEmail={TRAINER_EMAIL}
        />

        {/* 6. Formulario de Contacto (Oculto) */}
        {/* <Contact /> */}

        {/* 8. White Banner Footer: "¿LISTO PARA EMPEZAR? Tu objetivo esta a un clic de distancia" */}
        <ReadyToStartCTA
          onOpenCalculator={scrollToCalculator}
        />
      </main>

      {/* Bottom Technical Bar */}
      <footer className="bg-black border-t border-zinc-900 py-6 text-zinc-500 text-xs text-center font-montserrat">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} TITAN FORGE. Más que un entrenamiento, es forjar el carácter.</p>

          <p className="text-zinc-400">
            Realizado por:{' '}
            <a
              href="https://www.giomerida.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E50914] hover:text-white font-bold transition-colors underline underline-offset-4"
            >
              GioDev.
            </a>
          </p>

          <div className="flex items-center gap-2 text-zinc-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Google Calendar & Gmail Sync Integrado</span>
          </div>
        </div>
      </footer>

      {/* BMI Calculator Popup Modal */}
      <BMICalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onSelectPlanAndBook={(level) => handleSelectPlanAndBook(level)}
      />
    </div>
  );
}
