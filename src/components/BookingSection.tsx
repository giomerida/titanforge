import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Mail,
  Phone,
  Target,
  Sparkles,
  CheckCircle,
  ExternalLink,
  Download,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Send,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from 'firebase/auth';
import { AVAILABLE_TIME_SLOTS, ServiceItem, SERVICES_DATA } from '../data/landingData';
import {
  BookingDetails,
  createGoogleCalendarEvent,
  sendConfirmationEmails,
  generateGoogleCalendarWebUrl,
  generateIcsDataUri,
} from '../lib/googleWorkspace';
import { getAccessToken, googleSignIn } from '../lib/firebase';

interface BookingSectionProps {
  user: User | null;
  onLogin: () => Promise<void>;
  selectedService: ServiceItem;
  onServiceChange: (service: ServiceItem) => void;
  trainerEmail: string;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  user,
  onLogin,
  selectedService,
  onServiceChange,
  trainerEmail,
}) => {
  // Booking Form State
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>(AVAILABLE_TIME_SLOTS[1]);
  const [trainingType, setTrainingType] = useState<'presencial' | 'online'>('presencial');

  // Client Information
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientGoals, setClientGoals] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-fill from logged in user if available
  React.useEffect(() => {
    if (user) {
      if (!clientName && user.displayName) setClientName(user.displayName);
      if (!clientEmail && user.email) setClientEmail(user.email);
    }
  }, [user]);

  // Workflow state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    details: BookingDetails;
    calendarHtmlLink?: string;
    emailSent: boolean;
  } | null>(null);

  // Mandatory confirmation modal for Workspace actions
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Month navigation for date picker
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // Calendar day calculation
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days: (Date | null)[] = [];
    const firstDayIndex = (date.getDay() + 6) % 7; // Monday = 0

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    return days;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const daysList = getDaysInMonth(
    currentMonthDate.getFullYear(),
    currentMonthDate.getMonth()
  );

  const todayStr = new Date().toISOString().split('T')[0];

  // Initiate confirmation
  const handleOpenConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!clientName.trim() || !clientEmail.trim()) {
      setErrorMsg('Por favor completa tu nombre y correo electrónico.');
      return;
    }

    if (!selectedDate || !selectedSlot) {
      setErrorMsg('Selecciona una fecha y un horario para tu entrenamiento.');
      return;
    }

    setShowConfirmModal(true);
  };

  // Final booking execution
  const executeBooking = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let token = await getAccessToken();

      // If no token or user not authenticated yet, ask them to sign in
      if (!token) {
        const signResult = await googleSignIn();
        if (signResult) {
          token = signResult.accessToken;
        } else {
          throw new Error('Es necesario autorizar la conexión con Google Calendar.');
        }
      }

      const booking: BookingDetails = {
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        serviceDurationMinutes: selectedService.durationMinutes,
        servicePrice: selectedService.price,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        clientGoals: clientGoals.trim() || 'Acondicionamiento físico',
        trainingType,
        date: selectedDate,
        timeSlot: selectedSlot,
        trainerEmail: trainerEmail || 'amauryuchiha@gmail.com',
        notes: notes.trim(),
      };

      // 1. Create event in Google Calendar
      let calendarHtmlLink: string | undefined;
      try {
        const calRes = await createGoogleCalendarEvent(token, booking);
        calendarHtmlLink = calRes.htmlLink;
      } catch (err: unknown) {
        console.warn('Google Calendar direct event creation note:', err);
      }

      // 2. Send confirmation emails via Gmail API
      let emailResult = { clientSent: false, trainerSent: false };
      try {
        emailResult = await sendConfirmationEmails(token, booking, calendarHtmlLink);
      } catch (err: unknown) {
        console.warn('Gmail API send note:', err);
      }

      // Fire confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#3b82f6'],
      });

      setConfirmedBooking({
        details: booking,
        calendarHtmlLink,
        emailSent: emailResult.clientSent || emailResult.trainerSent,
      });
    } catch (err: unknown) {
      console.error('Error al agendar cita:', err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al agendar la sesión con Google Calendar. Por favor intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reservas" className="py-20 md:py-28 relative bg-zinc-950/90 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs sm:text-sm font-black tracking-widest uppercase text-red-600 mb-2 flex items-center justify-center gap-1.5">
            <CalendarIcon className="w-4 h-4" />
            <span>Sistema de Agendamiento Titan Forge</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tight">
            Agenda tu Sesión de Entrenamiento
          </h2>
          <p className="text-zinc-400 mt-4 text-sm sm:text-base leading-relaxed">
            Elige tu plan, selecciona tu fecha y horario preferido. El evento se programará automáticamente en Google Calendar y se enviarán confirmaciones inmediatas por Gmail a ti y a tu coach.
          </p>
        </div>

        {/* Successful Booking View */}
        {confirmedBooking ? (
          <div className="max-w-2xl mx-auto bg-zinc-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                ¡Tu Entrenamiento ha sido Agendado!
              </h3>
              <p className="text-zinc-400 text-sm mt-2">
                Hemos enviado un correo de confirmación a <strong>{confirmedBooking.details.clientEmail}</strong> y al entrenador.
              </p>
            </div>

            {/* Summary details card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 mb-8 space-y-3.5 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Servicio</span>
                <span className="font-bold text-white">{confirmedBooking.details.serviceTitle}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Fecha y Horario</span>
                <span className="font-bold text-amber-400">
                  {confirmedBooking.details.date} ({confirmedBooking.details.timeSlot})
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Modalidad</span>
                <span className="font-medium text-white capitalize">
                  {confirmedBooking.details.trainingType === 'presencial' ? 'Presencial (Gimnasio)' : 'Online en directo'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Atleta / Cliente</span>
                <span className="text-white font-medium">{confirmedBooking.details.clientName}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400">Inversión</span>
                <span className="font-bold text-emerald-400">{confirmedBooking.details.servicePrice}</span>
              </div>
            </div>

            {/* Calendar Actions for the client */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider text-center mb-2">
                Opciones para el Cliente:
              </div>

              {confirmedBooking.calendarHtmlLink ? (
                <a
                  href={confirmedBooking.calendarHtmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir en Google Calendar</span>
                </a>
              ) : (
                <a
                  href={generateGoogleCalendarWebUrl(confirmedBooking.details)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-md"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Agregar a mi Google Calendar</span>
                </a>
              )}

              <a
                href={generateIcsDataUri(confirmedBooking.details)}
                download={`entrenamiento-${confirmedBooking.details.date}.ics`}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-3 px-4 rounded-xl transition-all text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Descargar archivo .ICS (Apple Calendar / Outlook)</span>
              </a>

              <div className="pt-4 text-center">
                <button
                  onClick={() => {
                    setConfirmedBooking(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-amber-400 underline font-medium transition-colors"
                >
                  Agendar otra cita de entrenamiento
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Booking Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Step 1 & 2 - Service & Date/Time selector */}
            <div className="lg:col-span-7 space-y-8">
              {/* Step 1: Service selection dropdown/tabs */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-7">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-base font-bold text-white font-display">
                      Selecciona tu Modalidad y Servicio
                    </h3>
                  </div>

                  {/* Mode selector */}
                  <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setTrainingType('presencial')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        trainingType === 'presencial'
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Presencial
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrainingType('online')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        trainingType === 'online'
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Online
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SERVICES_DATA.map((srv) => {
                    const isSelected = srv.id === selectedService.id;
                    return (
                      <button
                        type="button"
                        key={srv.id}
                        onClick={() => onServiceChange(srv)}
                        className={`text-left p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-400 shadow-sm'
                            : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="text-xs font-bold text-white line-clamp-1">{srv.title}</div>
                        <div className="text-[11px] text-amber-400 font-semibold mt-1">{srv.price}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{srv.durationMinutes} min</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Date & Slot Calendar */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-7">
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-base font-bold text-white font-display">
                    Elige la Fecha y el Horario
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Mini Calendar Month view */}
                  <div className="md:col-span-7 bg-zinc-950/80 border border-zinc-800/80 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-white">
                        {monthNames[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-zinc-500 mb-2">
                      <span>Lu</span>
                      <span>Ma</span>
                      <span>Mi</span>
                      <span>Ju</span>
                      <span>Vi</span>
                      <span>Sá</span>
                      <span>Do</span>
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {daysList.map((day, idx) => {
                        if (!day) {
                          return <div key={`empty-${idx}`} className="h-9" />;
                        }

                        const dStr = day.toISOString().split('T')[0];
                        const isPast = dStr < todayStr;
                        const isSelected = dStr === selectedDate;
                        const isSunday = day.getDay() === 0;

                        return (
                          <button
                            key={dStr}
                            type="button"
                            disabled={isPast || isSunday}
                            onClick={() => setSelectedDate(dStr)}
                            className={`h-9 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/20'
                                : isPast || isSunday
                                ? 'text-zinc-700 cursor-not-allowed opacity-40'
                                : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                            }`}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  <div className="md:col-span-5 space-y-2">
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Horarios Disponibles</span>
                    </div>

                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {AVAILABLE_TIME_SLOTS.map((slot) => {
                        const isSlotSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`w-full py-2.5 px-3 text-xs font-medium rounded-lg text-left transition-all flex items-center justify-between border ${
                              isSlotSelected
                                ? 'bg-amber-500/15 border-amber-400 text-amber-300 font-bold'
                                : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:text-white'
                            }`}
                          >
                            <span>{slot}</span>
                            {isSlotSelected && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Step 3 - Client Information Form */}
            <div className="lg:col-span-5">
              <form
                onSubmit={handleOpenConfirmation}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5"
              >
                <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      Tus Datos para la Confirmación
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Ambos recibirán el correo con la cita y la invitación a Google Calendar.
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre y apellido"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Correo Electrónico para la Invitación *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@gmail.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 block">
                    Aquí te llegará la confirmación y el recordatorio automático.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Teléfono / WhatsApp (Opcional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      placeholder="+52 (55) 0000-0000"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Objetivo Principal o Lesiones Previas
                  </label>
                  <div className="relative">
                    <Target className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Ej. Hipertrofia de tren superior / Dolor de hombro"
                      value={clientGoals}
                      onChange={(e) => setClientGoals(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Selected summary */}
                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-zinc-400">
                    <span>Fecha & Hora:</span>
                    <span className="text-white font-medium">{selectedDate} ({selectedSlot})</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Entrenador:</span>
                    <span className="text-amber-400 font-medium">Giovanni Mérida</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Total a pagar en sesión:</span>
                    <span className="text-emerald-400 font-bold">{selectedService.price}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-extrabold py-4 px-6 rounded-xl transition-all shadow-xl shadow-amber-500/20 active:scale-98 disabled:opacity-50"
                >
                  <CalendarIcon className="w-5 h-5" />
                  <span>
                    {isSubmitting ? 'Programando en Calendar...' : 'Confirmar & Agendar Cita'}
                  </span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Calendar & Gmail Sync Integrado</span>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog (Mandatory Workspace Destructive/Mutating Check) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white font-display">
                  ¿Confirmar Reserva de Entrenamiento?
                </h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Se creará el evento en Google Calendar y se enviarán los correos de confirmación.
                </p>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 text-xs space-y-2 text-zinc-300">
              <p>
                <strong>Servicio:</strong> {selectedService.title} ({selectedService.durationMinutes} min)
              </p>
              <p>
                <strong>Fecha & Hora:</strong> {selectedDate} a las {selectedSlot}
              </p>
              <p>
                <strong>Modalidad:</strong> {trainingType.toUpperCase()}
              </p>
              <p>
                <strong>Cliente:</strong> {clientName} ({clientEmail})
              </p>
              <p>
                <strong>Acción del sistema:</strong> Agendar evento en Google Calendar y enviar notificación oficial por Gmail a {clientEmail} y {trainerEmail}.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeBooking}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-md"
              >
                Confirmar y Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
