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
import { AthletePortal } from './components/AthletePortal';
import { AdminPortal } from './components/AdminPortal';
import { SERVICES_DATA, ServiceItem } from './data/landingData';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { BookingDetails } from './lib/googleWorkspace';
import {
  AthleteRecord,
  ScheduledSession,
  WeeksByLevel,
  loadAthletes,
  saveAthletes,
  loadSessions,
  saveSessions,
  loadWeeksByLevel,
  saveWeeksByLevel,
  loadCalendarEmail,
  saveCalendarEmail,
} from './data/titanForgeStore';
import { ShieldCheck, Shield } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem>(SERVICES_DATA[1]); // Default to Intermedio
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'inscripcion' | 'atleta' | 'admin'>(() => {
    if (typeof window === 'undefined') return 'landing';
    if (window.location.hash === '#admin') return 'admin';
    if (window.location.hash === '#atleta') return 'atleta';
    if (window.location.hash === '#inscripcion') return 'inscripcion';
    return 'landing';
  });
  const [enrollmentPlan, setEnrollmentPlan] = useState<EnrollmentPlanInfo | null>({
    level: 'intermedio',
    planName: 'Performance',
    price: '$45 USD',
  });

  // Shared persisted store state for Athletes, Weeks/Videos by Level, and Sessions
  const [athletes, setAthletes] = useState<AthleteRecord[]>(() => loadAthletes());
  const [weeksByLevel, setWeeksByLevel] = useState<WeeksByLevel>(() => loadWeeksByLevel());
  const [sessions, setSessions] = useState<ScheduledSession[]>(() => loadSessions());

  const handleUpdateAthletes = (updated: AthleteRecord[]) => {
    setAthletes(updated);
    saveAthletes(updated);
  };

  const handleUpdateWeeksByLevel = (updated: WeeksByLevel) => {
    setWeeksByLevel(updated);
    saveWeeksByLevel(updated);
  };

  const handleUpdateSessions = (updated: ScheduledSession[]) => {
    setSessions(updated);
    saveSessions(updated);
  };

  // Configurable trainer/admin Gmail account for Google Calendar & notifications
  const [trainerEmail, setTrainerEmail] = useState<string>(() => loadCalendarEmail());

  const handleUpdateTrainerEmail = (newEmail: string) => {
    const clean = newEmail.trim();
    if (!clean) return;
    setTrainerEmail(clean);
    saveCalendarEmail(clean);
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (window.location.hash === '#atleta') {
        setCurrentView('atleta');
      } else if (window.location.hash === '#inscripcion') {
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

  const handleNavigateToAthletePortal = () => {
    setCurrentView('atleta');
    window.location.hash = 'atleta';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAdminPortal = () => {
    setCurrentView('admin');
    window.location.hash = 'admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        if (result.user.email?.toLowerCase() === trainerEmail.toLowerCase()) {
          handleNavigateToAdminPortal();
        } else {
          handleNavigateToAthletePortal();
        }
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
      if (currentView === 'atleta' || currentView === 'admin') {
        handleNavigateHome();
      }
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
    if (currentView !== 'landing') {
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

  const handleAthleteEnrolled = (data: {
    fullName: string;
    email: string;
    phone: string;
    planName: 'Fundation' | 'Performance' | 'Elite';
    membershipId: string;
  }) => {
    const today = new Date();
    const enrollmentDate = today.toISOString().split('T')[0];
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    const nextPaymentDate = nextMonth.toISOString().split('T')[0];

    const newAthlete: AthleteRecord = {
      id: `ath-${Date.now()}`,
      membershipId: data.membershipId,
      fullName: data.fullName || 'Nuevo Atleta Titan',
      email: data.email || '',
      phone: data.phone || '',
      planName: data.planName,
      goal: 'Evaluación inicial y recomposición física',
      status: 'Activo',
      enrollmentDate,
      paymentDayOfMonth: today.getDate(),
      nextPaymentDate,
      assignedCoach: 'Coach Titan Forge',
      notes: 'Inscrito desde el Portal de Inscripción Oficial.',
    };

    const existingIdx = athletes.findIndex(
      (a) => a.email.toLowerCase() === newAthlete.email.toLowerCase() && newAthlete.email !== ''
    );

    if (existingIdx >= 0) {
      const updated = [...athletes];
      updated[existingIdx] = { ...updated[existingIdx], ...newAthlete, id: updated[existingIdx].id };
      handleUpdateAthletes(updated);
    } else {
      handleUpdateAthletes([newAthlete, ...athletes]);
    }
  };

  const handleBookingConfirmed = (booking: BookingDetails) => {
    const newSession: ScheduledSession = {
      id: `sess-${Date.now()}`,
      date: booking.date,
      timeSlot: booking.timeSlot,
      athleteName: booking.clientName,
      athleteEmail: booking.clientEmail,
      athletePhone: booking.clientPhone,
      planTitle: booking.serviceTitle,
      trainingType: booking.trainingType,
      goal: booking.clientGoals || 'Sesión personalizada Titan Forge',
      status: 'Confirmada',
      source: 'Sistema Web',
      notes: booking.notes || `Agendada desde la plataforma (${booking.trainingType}).`,
    };
    handleUpdateSessions([newSession, ...sessions]);
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
          if (currentView !== 'landing') {
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
        onNavigateToAthletePortal={handleNavigateToAthletePortal}
        onNavigateToAdminPortal={handleNavigateToAdminPortal}
        onNavigateHome={handleNavigateHome}
        currentView={currentView}
        trainerEmail={trainerEmail}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'admin' ? (
          /* SECCIÓN INDEPENDIENTE: PANEL DE ADMINISTRADOR */
          <AdminPortal
            user={user}
            trainerEmail={trainerEmail}
            onUpdateTrainerEmail={handleUpdateTrainerEmail}
            athletes={athletes}
            onUpdateAthletes={handleUpdateAthletes}
            weeksByLevel={weeksByLevel}
            onUpdateWeeksByLevel={handleUpdateWeeksByLevel}
            sessions={sessions}
            onUpdateSessions={handleUpdateSessions}
            onNavigateHome={handleNavigateHome}
            onNavigateToAthletePortal={handleNavigateToAthletePortal}
            onLogout={handleLogout}
          />
        ) : currentView === 'atleta' ? (
          /* SECCIÓN INDEPENDIENTE: PORTAL DEL ATLETA */
          <AthletePortal
            user={user}
            planInfo={enrollmentPlan}
            weeksByLevel={weeksByLevel}
            onNavigateHome={handleNavigateHome}
            onLogout={handleLogout}
            onScrollToBooking={() => {
              setCurrentView('landing');
              window.location.hash = 'reservas';
              setTimeout(() => scrollToBooking(), 120);
            }}
            trainerEmail={trainerEmail}
          />
        ) : currentView === 'inscripcion' ? (
          /* SECCIÓN INDEPENDIENTE: PORTAL DE INSCRIPCIÓN OFICIAL */
          <EnrollmentSection
            currentPlan={enrollmentPlan}
            onPlanChange={(plan) => setEnrollmentPlan(plan)}
            user={user}
            onSuccessSchedule={handleEnrollmentSuccessSchedule}
            onNavigateToPortal={handleNavigateToAthletePortal}
            onBackToHome={handleNavigateHome}
            onAthleteEnrolled={handleAthleteEnrolled}
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
              trainerEmail={trainerEmail}
              onBookingConfirmed={handleBookingConfirmed}
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

          <div className="flex flex-wrap items-center justify-center gap-4 text-zinc-400 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Google Calendar & Gmail Sync Integrado</span>
            </div>
            <button
              type="button"
              onClick={handleNavigateToAdminPortal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Panel Admin</span>
            </button>
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
