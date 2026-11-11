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
import { EnrollmentSection, EnrollmentPlanInfo } from './components/EnrollmentSection';
import { SERVICES_DATA, ServiceItem } from './data/landingData';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem>(SERVICES_DATA[1]); // Default to Intermedio
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'inscripcion'>(() => {
    return typeof window !== 'undefined' && window.location.hash === '#inscripcion'
      ? 'inscripcion'
      : 'landing';
  });
  const [enrollmentPlan, setEnrollmentPlan] = useState<EnrollmentPlanInfo | null>({
    level: 'intermedio',
    planName: 'Performance',
    price: '$45 USD',
  });

  // Trainer's email account for notifications & calendars
  const TRAINER_EMAIL = 'amauryuchiha@gmail.com';

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#inscripcion') {
        setCurrentView('inscripcion');
      } else if (window.location.hash === '' || window.location.hash === '#' || window.location.hash === '#inicio') {
        setCurrentView('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  const handleOpenEnrollment = (plan: EnrollmentPlanInfo) => {
    setEnrollmentPlan(plan);
    setCurrentView('inscripcion');
    window.location.hash = 'inscripcion';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setCurrentView('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnrollmentSuccessSchedule = () => {
    if (enrollmentPlan) {
      const matched =
        SERVICES_DATA.find((s) => s.levelKey === enrollmentPlan.level) ||
        SERVICES_DATA[1];
      setSelectedService(matched);
    }
    setCurrentView('landing');
    window.location.hash = 'reservas';
    setTimeout(() => {
      scrollToBooking();
    }, 120);
  };

  const scrollToCalculator = () => {
    if (currentView === 'inscripcion') {
      setCurrentView('landing');
      window.location.hash = 'calculadora';
      setTimeout(() => {
        const el = document.getElementById('calculadora');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
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
        onScrollToBooking={() => {
          if (currentView === 'inscripcion') {
            setCurrentView('landing');
            setTimeout(() => scrollToBooking(), 100);
          } else {
            scrollToBooking();
          }
        }}
        onOpenCalculator={scrollToCalculator}
        onNavigateToEnrollment={() => {
          setCurrentView('inscripcion');
          window.location.hash = 'inscripcion';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateHome={handleNavigateHome}
        currentView={currentView}
        trainerEmail={TRAINER_EMAIL}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'inscripcion' ? (
          /* SECCIÓN INDEPENDIENTE: PORTAL DE INSCRIPCIÓN OFICIAL */
          <EnrollmentSection
            currentPlan={enrollmentPlan}
            onPlanChange={(plan) => setEnrollmentPlan(plan)}
            user={user}
            onSuccessSchedule={handleEnrollmentSuccessSchedule}
            onBackToHome={handleNavigateHome}
          />
        ) : (
          /* VISTA PRINCIPAL: LANDING COMPLETA */
          <>
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
              onEnrollPlan={handleOpenEnrollment}
              onOpenCalculator={scrollToCalculator}
            />

            {/* 3. PASO 2: "RECIBE TU PROGRAMA" - FUNDATION, PERFORMANCE, ELITE with VER PLAN popup */}
            <ProgramStepSection
              services={SERVICES_DATA}
              onSelectPlanAndBook={handleSelectPlanAndBook}
              onEnrollPlan={handleOpenEnrollment}
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

            {/* 6. Banner Final CTA: "¿LISTO PARA EMPEZAR?" */}
            <ReadyToStartCTA
              onOpenCalculator={scrollToCalculator}
            />
          </>
        )}
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
