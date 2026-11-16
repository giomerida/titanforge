import React, { useState, useEffect } from 'react';
import {
  Users,
  Video,
  Calendar as CalendarIcon,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Play,
  Upload,
  Link as LinkIcon,
  Save,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  RefreshCw,
  Copy,
  Check,
  FileText,
  Sparkles,
  Phone,
  Mail,
  Target,
  Dumbbell,
  ExternalLink,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  AthleteRecord,
  ExerciseVideoItem,
  ScheduledSession,
  WeekPlan,
  WorkoutDay,
  ProgramLevel,
  WeeksByLevel,
  PROGRAM_LEVELS,
  isDirectVideoFile,
  normalizeVideoUrl,
} from '../data/titanForgeStore';
import { fetchGoogleCalendarEvents } from '../lib/googleWorkspace';
import { getAccessToken, googleSignIn } from '../lib/firebase';

interface AdminPortalProps {
  user: User | null;
  trainerEmail: string;
  onUpdateTrainerEmail?: (email: string) => void;
  athletes: AthleteRecord[];
  onUpdateAthletes: (athletes: AthleteRecord[]) => void;
  weeksByLevel: WeeksByLevel;
  onUpdateWeeksByLevel: (updated: WeeksByLevel) => void;
  sessions: ScheduledSession[];
  onUpdateSessions: (sessions: ScheduledSession[]) => void;
  onNavigateHome: () => void;
  onNavigateToAthletePortal: () => void;
  onLogout: () => void;
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const DEFAULT_THUMBNAILS: Record<ExerciseVideoItem['category'], string> = {
  Fuerza:
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  Potencia:
    'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=800&q=80',
  Movilidad:
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  Metabólico:
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
};

export const AdminPortal: React.FC<AdminPortalProps> = ({
  user,
  trainerEmail,
  onUpdateTrainerEmail,
  athletes,
  onUpdateAthletes,
  weeksByLevel,
  onUpdateWeeksByLevel,
  sessions,
  onUpdateSessions,
  onNavigateHome,
  onNavigateToAthletePortal,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'atletas' | 'rutinas' | 'calendario'>('atletas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // =========================================================================
  // TAB 1: ATHLETES DIRECTORY STATE (NO PAYMENT DETAILS — ONLY PAYMENT DATE)
  // =========================================================================
  const [athleteSearch, setAthleteSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'Todos' | 'Fundation' | 'Performance' | 'Elite'>('Todos');
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteRecord | null>(null);
  const [editingAthlete, setEditingAthlete] = useState<AthleteRecord | null>(null);
  const [showNewAthleteModal, setShowNewAthleteModal] = useState(false);

  const [newAthleteForm, setNewAthleteForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    planName: 'Performance' as 'Fundation' | 'Performance' | 'Elite',
    goal: '',
    paymentDayOfMonth: 10,
    nextPaymentDate: '10 de Diciembre de 2026',
    notes: '',
  });

  const filteredAthletes = athletes.filter((ath) => {
    const matchesPlan = planFilter === 'Todos' || ath.planName === planFilter;
    const q = athleteSearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      ath.fullName.toLowerCase().includes(q) ||
      ath.email.toLowerCase().includes(q) ||
      ath.membershipId.toLowerCase().includes(q) ||
      ath.goal.toLowerCase().includes(q);
    return matchesPlan && matchesQuery;
  });

  const handleSaveAthleteEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAthlete) return;
    const updated = athletes.map((a) => (a.id === editingAthlete.id ? editingAthlete : a));
    onUpdateAthletes(updated);
    if (selectedAthlete?.id === editingAthlete.id) {
      setSelectedAthlete(editingAthlete);
    }
    setEditingAthlete(null);
    showToast('Ficha del atleta y fecha de pago actualizadas.');
  };

  const handleCreateAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAthleteForm.fullName.trim() || !newAthleteForm.email.trim()) return;
    const created: AthleteRecord = {
      id: `ath-${Date.now()}`,
      membershipId: `#TF-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: newAthleteForm.fullName.trim(),
      email: newAthleteForm.email.trim(),
      phone: newAthleteForm.phone.trim() || 'Por registrar',
      planName: newAthleteForm.planName,
      goal: newAthleteForm.goal.trim() || 'Acondicionamiento físico integral',
      status: 'Activo',
      enrollmentDate: new Date().toISOString().split('T')[0],
      paymentDayOfMonth: Number(newAthleteForm.paymentDayOfMonth) || 10,
      nextPaymentDate: newAthleteForm.nextPaymentDate.trim() || 'Día 10 próximo mes',
      assignedCoach: 'Giovanni Mérida',
      notes: newAthleteForm.notes.trim(),
    };
    onUpdateAthletes([created, ...athletes]);
    setShowNewAthleteModal(false);
    setNewAthleteForm({
      fullName: '',
      email: '',
      phone: '',
      planName: 'Performance',
      goal: '',
      paymentDayOfMonth: 10,
      nextPaymentDate: '10 de Diciembre de 2026',
      notes: '',
    });
    showToast(`Atleta ${created.fullName} agregado a la lista.`);
  };

  // =========================================================================
  // TAB 2: ROUTINE VIDEOS & DESCRIPTIONS BY LEVEL, DAY AND WEEK (1 TO 4)
  // =========================================================================
  const [selectedLevel, setSelectedLevel] = useState<ProgramLevel>('Fundation');
  const weeksData = weeksByLevel[selectedLevel] || [];
  const onUpdateWeeksData = (updatedWeeks: WeekPlan[]) => {
    onUpdateWeeksByLevel({
      ...weeksByLevel,
      [selectedLevel]: updatedWeeks,
    });
  };

  const [adminWeekNum, setAdminWeekNum] = useState<number>(1);
  const [adminDayNum, setAdminDayNum] = useState<number>(1);
  const [previewVideoExercise, setPreviewVideoExercise] = useState<ExerciseVideoItem | null>(null);

  // Editable week description state
  const currentWeek =
    weeksData.find((w) => w.weekNumber === adminWeekNum) || weeksData[0];
  const currentDay =
    currentWeek.days.find((d) => d.dayNumber === adminDayNum) || currentWeek.days[0];

  const [isEditingWeekDesc, setIsEditingWeekDesc] = useState(false);
  const [weekDraft, setWeekDraft] = useState<WeekPlan>(currentWeek);

  const [isEditingDayDesc, setIsEditingDayDesc] = useState(false);
  const [dayDraft, setDayDraft] = useState<{
    dayName: string;
    focus: string;
    estimatedDuration: string;
  }>({
    dayName: currentDay?.dayName || '',
    focus: currentDay?.focus || '',
    estimatedDuration: currentDay?.estimatedDuration || '60 min',
  });

  const selectLevel = (level: ProgramLevel) => {
    setSelectedLevel(level);
    const levelWeeks = weeksByLevel[level] || [];
    const targetWeek = levelWeeks.find((w) => w.weekNumber === 1) || levelWeeks[0];
    setAdminWeekNum(targetWeek ? targetWeek.weekNumber : 1);
    if (targetWeek) {
      setWeekDraft(targetWeek);
      const firstDay = targetWeek.days[0];
      setAdminDayNum(firstDay ? firstDay.dayNumber : 1);
      if (firstDay) {
        setDayDraft({
          dayName: firstDay.dayName,
          focus: firstDay.focus,
          estimatedDuration: firstDay.estimatedDuration,
        });
      }
    }
    setIsEditingWeekDesc(false);
    setIsEditingDayDesc(false);
  };

  const selectWeek = (weekNum: number) => {
    setAdminWeekNum(weekNum);
    const w = weeksData.find((item) => item.weekNumber === weekNum) || weeksData[0];
    setWeekDraft(w);
    setIsEditingWeekDesc(false);
    const firstDay = w.days[0];
    setAdminDayNum(firstDay ? firstDay.dayNumber : 1);
    if (firstDay) {
      setDayDraft({
        dayName: firstDay.dayName,
        focus: firstDay.focus,
        estimatedDuration: firstDay.estimatedDuration,
      });
    }
    setIsEditingDayDesc(false);
  };

  const selectDay = (day: WorkoutDay) => {
    setAdminDayNum(day.dayNumber);
    setDayDraft({
      dayName: day.dayName,
      focus: day.focus,
      estimatedDuration: day.estimatedDuration,
    });
    setIsEditingDayDesc(false);
  };

  const handleSaveWeekDescription = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = weeksData.map((w) =>
      w.weekNumber === adminWeekNum
        ? {
            ...w,
            title: weekDraft.title,
            phaseName: weekDraft.phaseName,
            rirTarget: weekDraft.rirTarget,
            volumeTarget: weekDraft.volumeTarget,
            description: weekDraft.description,
            coachAdvice: weekDraft.coachAdvice,
          }
        : w
    );
    onUpdateWeeksData(updated);
    setIsEditingWeekDesc(false);
    showToast(`Descripción de la Semana ${adminWeekNum} guardada correctamente.`);
  };

  const handleSaveDayDescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDay) return;
    const updated = weeksData.map((w) => {
      if (w.weekNumber !== adminWeekNum) return w;
      return {
        ...w,
        days: w.days.map((d) =>
          d.dayNumber === currentDay.dayNumber
            ? {
                ...d,
                dayName: dayDraft.dayName,
                focus: dayDraft.focus,
                estimatedDuration: dayDraft.estimatedDuration,
              }
            : d
        ),
      };
    });
    onUpdateWeeksData(updated);
    setIsEditingDayDesc(false);
    showToast(`Descripción del Día ${currentDay.dayNumber} actualizada.`);
  };

  const handleAddDayToWeek = () => {
    const nextDayNum =
      currentWeek.days.length > 0
        ? Math.max(...currentWeek.days.map((d) => d.dayNumber)) + 1
        : 1;
    const newDay: WorkoutDay = {
      dayNumber: nextDayNum,
      dayName: `Día ${nextDayNum}: Sesión Complementaria`,
      focus: 'Desarrollo técnico, fuerza y acondicionamiento metabólico',
      estimatedDuration: '60 min',
      exercises: [],
    };
    const updated = weeksData.map((w) =>
      w.weekNumber === adminWeekNum ? { ...w, days: [...w.days, newDay] } : w
    );
    onUpdateWeeksData(updated);
    selectDay(newDay);
    showToast(`Día ${nextDayNum} agregado a la Semana ${adminWeekNum}.`);
  };

  // Upload / Add / Edit Video Form State
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [videoSourceType, setVideoSourceType] = useState<'file' | 'url'>('file');
  const [selectedTargetWeeks, setSelectedTargetWeeks] = useState<number[]>([1]);
  const [targetDayNumber, setTargetDayNumber] = useState<number>(1);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    category: 'Fuerza' as ExerciseVideoItem['category'],
    setsReps: '4 series x 8–10 repeticiones',
    rir: 'RIR 2',
    rest: '90 seg',
    videoUrl: '',
    videoThumbnail: '',
    muscleGroup: '',
    technicalTipsText: '',
    commonMistakes: '',
    uploadedFileName: '',
  });

  // Sync / Adjust existing exercise across weeks modal
  const [adjustWeeksExercise, setAdjustWeeksExercise] = useState<ExerciseVideoItem | null>(null);
  const [adjustWeekTargets, setAdjustWeekTargets] = useState<number[]>([1]);
  const [adjustDayTarget, setAdjustDayTarget] = useState<number>(1);

  const openNewVideoModal = () => {
    setEditingExerciseId(null);
    setVideoSourceType('file');
    setSelectedTargetWeeks([adminWeekNum]);
    setTargetDayNumber(currentDay?.dayNumber || 1);
    setExerciseForm({
      name: '',
      category: 'Fuerza',
      setsReps: '4 series x 8–10 repeticiones',
      rir: 'RIR 2',
      rest: '90 seg',
      videoUrl: '',
      videoThumbnail: '',
      muscleGroup: '',
      technicalTipsText: '',
      commonMistakes: '',
      uploadedFileName: '',
    });
    setShowVideoModal(true);
  };

  const openEditVideoModal = (ex: ExerciseVideoItem) => {
    setEditingExerciseId(ex.id);
    setVideoSourceType(ex.isUploadedFile ? 'file' : 'url');
    setSelectedTargetWeeks([adminWeekNum]);
    setTargetDayNumber(currentDay?.dayNumber || 1);
    setExerciseForm({
      name: ex.name,
      category: ex.category,
      setsReps: ex.setsReps,
      rir: ex.rir,
      rest: ex.rest,
      videoUrl: ex.videoUrl,
      videoThumbnail: ex.videoThumbnail,
      muscleGroup: ex.muscleGroup,
      technicalTipsText: ex.technicalTips.join('\n'),
      commonMistakes: ex.commonMistakes,
      uploadedFileName: ex.uploadedFileName || '',
    });
    setShowVideoModal(true);
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setExerciseForm((prev) => ({
      ...prev,
      videoUrl: objectUrl,
      uploadedFileName: file.name,
    }));
  };

  const toggleTargetWeek = (weekNum: number) => {
    setSelectedTargetWeeks((prev) =>
      prev.includes(weekNum)
        ? prev.length > 1
          ? prev.filter((w) => w !== weekNum)
          : prev
        : [...prev, weekNum].sort((a, b) => a - b)
    );
  };

  const handleSaveExerciseVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseForm.name.trim()) return;

    const finalVideoUrl =
      videoSourceType === 'url'
        ? normalizeVideoUrl(exerciseForm.videoUrl) ||
          'https://www.youtube-nocookie.com/embed/rT7DgCr-3pg?autoplay=1&mute=1&loop=1&playlist=rT7DgCr-3pg'
        : exerciseForm.videoUrl ||
          'https://www.youtube-nocookie.com/embed/rT7DgCr-3pg?autoplay=1&mute=1&loop=1&playlist=rT7DgCr-3pg';

    const tips = exerciseForm.technicalTipsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const baseExercise: ExerciseVideoItem = {
      id: editingExerciseId || `ex-${Date.now()}`,
      name: exerciseForm.name.trim(),
      category: exerciseForm.category,
      setsReps: exerciseForm.setsReps.trim() || '4 series x 8 reps',
      rir: exerciseForm.rir.trim() || 'RIR 2',
      rest: exerciseForm.rest.trim() || '90 seg',
      videoUrl: finalVideoUrl,
      videoThumbnail:
        exerciseForm.videoThumbnail.trim() || DEFAULT_THUMBNAILS[exerciseForm.category],
      technicalTips:
        tips.length > 0
          ? tips
          : ['Mantener control excéntrico y postura neutra durante toda la serie.'],
      muscleGroup: exerciseForm.muscleGroup.trim() || 'Cadena muscular principal',
      commonMistakes:
        exerciseForm.commonMistakes.trim() ||
        'Comprometer la técnica por utilizar exceso de carga.',
      isUploadedFile: videoSourceType === 'file' && !!exerciseForm.uploadedFileName,
      uploadedFileName: exerciseForm.uploadedFileName || undefined,
    };

    const updatedWeeks = weeksData.map((w) => {
      if (!selectedTargetWeeks.includes(w.weekNumber)) return w;

      const dayExists = w.days.some((d) => d.dayNumber === targetDayNumber);
      let nextDays = [...w.days];

      if (!dayExists) {
        nextDays.push({
          dayNumber: targetDayNumber,
          dayName: `Día ${targetDayNumber}: Rutina Asignada`,
          focus: 'Bloque de entrenamiento programado por el coach',
          estimatedDuration: '60 min',
          exercises: [
            {
              ...baseExercise,
              id:
                editingExerciseId && w.weekNumber === adminWeekNum
                  ? editingExerciseId
                  : `w${w.weekNumber}-d${targetDayNumber}-${Date.now()}`,
            },
          ],
        });
        nextDays.sort((a, b) => a.dayNumber - b.dayNumber);
      } else {
        nextDays = nextDays.map((d) => {
          if (d.dayNumber !== targetDayNumber) return d;
          if (editingExerciseId && w.weekNumber === adminWeekNum) {
            return {
              ...d,
              exercises: d.exercises.map((ex) =>
                ex.id === editingExerciseId ? baseExercise : ex
              ),
            };
          }
          // Avoid duplicates by name if applying across multiple weeks
          const existingIdx = d.exercises.findIndex(
            (ex) => ex.name.toLowerCase() === baseExercise.name.toLowerCase()
          );
          if (existingIdx >= 0) {
            const copy = [...d.exercises];
            copy[existingIdx] = { ...baseExercise, id: copy[existingIdx].id };
            return { ...d, exercises: copy };
          }
          return {
            ...d,
            exercises: [
              ...d.exercises,
              {
                ...baseExercise,
                id: `w${w.weekNumber}-d${targetDayNumber}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              },
            ],
          };
        });
      }

      return { ...w, days: nextDays };
    });

    onUpdateWeeksData(updatedWeeks);
    setShowVideoModal(false);
    showToast(
      editingExerciseId
        ? `Video y rutina "${baseExercise.name}" actualizados.`
        : `Video "${baseExercise.name}" subido al Día ${targetDayNumber} (Semanas: ${selectedTargetWeeks.join(', ')}).`
    );
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (!currentDay) return;
    const updated = weeksData.map((w) => {
      if (w.weekNumber !== adminWeekNum) return w;
      return {
        ...w,
        days: w.days.map((d) =>
          d.dayNumber === currentDay.dayNumber
            ? { ...d, exercises: d.exercises.filter((ex) => ex.id !== exerciseId) }
            : d
        ),
      };
    });
    onUpdateWeeksData(updated);
    showToast('Ejercicio eliminado del día seleccionado.');
  };

  const openAdjustWeeksModal = (ex: ExerciseVideoItem) => {
    const presentInWeeks = weeksData
      .filter((w) =>
        w.days.some((d) =>
          d.exercises.some((item) => item.name.toLowerCase() === ex.name.toLowerCase())
        )
      )
      .map((w) => w.weekNumber);
    setAdjustWeeksExercise(ex);
    setAdjustWeekTargets(presentInWeeks.length > 0 ? presentInWeeks : [adminWeekNum]);
    setAdjustDayTarget(currentDay?.dayNumber || 1);
  };

  const handleApplyWeekAdjustment = () => {
    if (!adjustWeeksExercise) return;
    const updated = weeksData.map((w) => {
      const shouldInclude = adjustWeekTargets.includes(w.weekNumber);
      const dayExists = w.days.some((d) => d.dayNumber === adjustDayTarget);

      if (shouldInclude) {
        if (!dayExists) {
          return {
            ...w,
            days: [
              ...w.days,
              {
                dayNumber: adjustDayTarget,
                dayName: `Día ${adjustDayTarget}: Rutina Ajustada`,
                focus: 'Sesión sincronizada desde el panel administrador',
                estimatedDuration: '60 min',
                exercises: [
                  {
                    ...adjustWeeksExercise,
                    id: `w${w.weekNumber}-d${adjustDayTarget}-${Date.now()}`,
                  },
                ],
              },
            ].sort((a, b) => a.dayNumber - b.dayNumber),
          };
        }
        return {
          ...w,
          days: w.days.map((d) => {
            if (d.dayNumber !== adjustDayTarget) return d;
            const already = d.exercises.some(
              (ex) => ex.name.toLowerCase() === adjustWeeksExercise.name.toLowerCase()
            );
            if (already) return d;
            return {
              ...d,
              exercises: [
                ...d.exercises,
                {
                  ...adjustWeeksExercise,
                  id: `w${w.weekNumber}-d${adjustDayTarget}-${Date.now()}`,
                },
              ],
            };
          }),
        };
      } else {
        // Remove from that day in unselected weeks
        return {
          ...w,
          days: w.days.map((d) =>
            d.dayNumber === adjustDayTarget
              ? {
                  ...d,
                  exercises: d.exercises.filter(
                    (ex) => ex.name.toLowerCase() !== adjustWeeksExercise.name.toLowerCase()
                  ),
                }
              : d
          ),
        };
      }
    });

    onUpdateWeeksData(updated);
    setAdjustWeeksExercise(null);
    showToast(
      `Rutina "${adjustWeeksExercise.name}" ajustada para Semana(s): ${adjustWeekTargets.join(', ')} (Día ${adjustDayTarget}).`
    );
  };

  // =========================================================================
  // TAB 3: PERSONALIZED SESSIONS CALENDAR & AGENDA
  // =========================================================================
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [sessionFilter, setSessionFilter] = useState<
    'Todas' | 'Confirmada' | 'Pendiente' | 'Completada'
  >('Todas');
  const [isSyncingGCal, setIsSyncingGCal] = useState(false);
  const [calendarEmailInput, setCalendarEmailInput] = useState(trainerEmail);
  const [calendarEmailError, setCalendarEmailError] = useState<string | null>(null);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);

  useEffect(() => {
    setCalendarEmailInput(trainerEmail);
  }, [trainerEmail]);

  const handleSaveCalendarEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = calendarEmailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleaned || !emailRegex.test(cleaned)) {
      setCalendarEmailError('Ingresa una cuenta de correo o Gmail válida (ej. entrenador@gmail.com).');
      return;
    }
    setCalendarEmailError(null);
    onUpdateTrainerEmail?.(cleaned);
    showToast(`Cuenta de calendario actualizada a ${cleaned}.`);
  };
  const [newSessionForm, setNewSessionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 - 11:00',
    athleteName: '',
    athleteEmail: '',
    athletePhone: '',
    planTitle: 'Performance · Hipertrofia & Rendimiento',
    goal: '',
    notes: '',
  });

  const getCalendarDays = (year: number, month: number) => {
    const first = new Date(year, month, 1);
    const days: (Date | null)[] = [];
    const offset = (first.getDay() + 6) % 7; // Mon = 0
    for (let i = 0; i < offset; i++) days.push(null);
    const cursor = new Date(year, month, 1);
    while (cursor.getMonth() === month) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  };

  const monthDays = getCalendarDays(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth()
  );

  const visibleSessions = sessions.filter((s) =>
    sessionFilter === 'Todas' ? true : s.status === sessionFilter
  );

  const sessionsForSelectedDay = visibleSessions
    .filter((s) => s.date === selectedCalendarDate)
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const upcomingSessions = visibleSessions
    .filter((s) => s.date >= new Date().toISOString().split('T')[0] && s.status !== 'Cancelada')
    .sort((a, b) => (a.date + a.timeSlot).localeCompare(b.date + b.timeSlot))
    .slice(0, 6);

  const handleUpdateSessionStatus = (
    sessionId: string,
    status: ScheduledSession['status']
  ) => {
    const updated = sessions.map((s) => (s.id === sessionId ? { ...s, status } : s));
    onUpdateSessions(updated);
    showToast(`Estado de sesión actualizado a ${status}.`);
  };

  const handleSyncGoogleCalendar = async () => {
    setIsSyncingGCal(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }
      if (!token) {
        showToast('Inicia sesión con tu cuenta Google para sincronizar Google Calendar.');
        return;
      }

      const startOfMonth = new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth(),
        1
      ).toISOString();
      const endOfMonth = new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString();

      const targetCalendarEmail = calendarEmailInput.trim() || trainerEmail || 'primary';
      const events = await fetchGoogleCalendarEvents(
        token,
        startOfMonth,
        endOfMonth,
        targetCalendarEmail
      );
      if (events.length === 0) {
        showToast(`Google Calendar (${targetCalendarEmail}) conectado. No hay eventos adicionales este mes.`);
        return;
      }

      const imported: ScheduledSession[] = events
        .filter((ev) => ev.start?.dateTime || ev.start?.date)
        .map((ev) => {
          const startIso = ev.start?.dateTime || `${ev.start?.date}T09:00:00`;
          const endIso = ev.end?.dateTime || `${ev.start?.date}T10:00:00`;
          const datePart = startIso.split('T')[0];
          const startTime = startIso.includes('T')
            ? startIso.split('T')[1].slice(0, 5)
            : '09:00';
          const endTime = endIso.includes('T') ? endIso.split('T')[1].slice(0, 5) : '10:00';
          const attendee = ev.attendees?.find(
            (a) => a.email?.toLowerCase() !== trainerEmail.toLowerCase()
          );
          return {
            id: `gcal-${ev.id}`,
            date: datePart,
            timeSlot: `${startTime} - ${endTime}`,
            athleteName:
              attendee?.displayName ||
              ev.summary?.replace('Entrenamiento Personal:', '').trim() ||
              'Sesión Google Calendar',
            athleteEmail: attendee?.email || trainerEmail,
            athletePhone: 'Sincronizado de Calendar',
            planTitle: ev.summary || 'Sesión Personalizada',
            trainingType: 'presencial',
            goal: ev.description?.slice(0, 110) || 'Evento importado de Google Calendar',
            status: 'Confirmada',
            source: 'Google Calendar',
          };
        });

      const existingIds = new Set(sessions.map((s) => s.id));
      const newOnes = imported.filter((item) => !existingIds.has(item.id));
      if (newOnes.length > 0) {
        onUpdateSessions([...sessions, ...newOnes]);
        showToast(`Sincronizadas ${newOnes.length} sesiones desde Google Calendar.`);
      } else {
        showToast('Calendario actualizado al día con Google Calendar.');
      }
    } catch (err) {
      console.error('Error syncing Google Calendar:', err);
      showToast('No se pudo conectar con Google Calendar. Verifica tus permisos.');
    } finally {
      setIsSyncingGCal(false);
    }
  };

  const handleCreateManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionForm.athleteName.trim()) return;
    const created: ScheduledSession = {
      id: `sess-${Date.now()}`,
      date: newSessionForm.date,
      timeSlot: newSessionForm.timeSlot,
      athleteName: newSessionForm.athleteName.trim(),
      athleteEmail: newSessionForm.athleteEmail.trim() || 'atleta@titanforge.com',
      athletePhone: newSessionForm.athletePhone.trim() || 'Sin teléfono',
      planTitle: newSessionForm.planTitle,
      trainingType: 'presencial',
      goal: newSessionForm.goal.trim() || 'Sesión personalizada presencial',
      status: 'Confirmada',
      source: 'Admin Manual',
      notes: newSessionForm.notes.trim(),
    };
    onUpdateSessions([...sessions, created]);
    setSelectedCalendarDate(created.date);
    setShowAddSessionModal(false);
    setNewSessionForm({
      date: selectedCalendarDate,
      timeSlot: '10:00 - 11:00',
      athleteName: '',
      athleteEmail: '',
      athletePhone: '',
      planTitle: 'Performance · Hipertrofia & Rendimiento',
      goal: '',
      notes: '',
    });
    showToast(`Sesión agendada para ${created.athleteName} el ${created.date}.`);
  };

  // Compute total videos across all levels and 4 weeks
  const totalRoutineVideos = Object.values(weeksByLevel).reduce(
    (levelSum, levelWeeks) =>
      levelSum +
      levelWeeks.reduce(
        (sum, w) => sum + w.days.reduce((dSum, d) => dSum + d.exercises.length, 0),
        0
      ),
    0
  );

  const isAdminAuthenticated =
    user?.email?.toLowerCase() === trainerEmail.toLowerCase();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-montserrat pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-900 border border-[#E50914] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Independent Admin Navigation Strip */}
      <div className="bg-[#121212] border-b border-zinc-800/90 sticky top-18 sm:top-20 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-3.5 flex flex-wrap items-center justify-between gap-3">
            {/* Left: Back & Admin Badge */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Volver a la web</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E50914]/15 border border-[#E50914]/40 text-[#E50914] text-[10px] sm:text-xs font-black uppercase tracking-widest">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Panel Administrador</span>
                </span>
                <span className="hidden md:inline-block text-xs text-zinc-400">
                  Coach: <strong className="text-white">Giovanni Mérida</strong>
                </span>
              </div>
            </div>

            {/* Right: Athlete Portal Switch & Logout */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onNavigateToAthletePortal}
                className="text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#E50914]" />
                <span className="hidden sm:inline">Vista Portal Atleta</span>
                <span className="sm:hidden">Vista Atleta</span>
              </button>

              {user && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs text-zinc-400 hover:text-red-400 font-bold px-2 py-1.5 transition-colors cursor-pointer"
                >
                  Salir
                </button>
              )}
            </div>
          </div>

          {/* Admin Section Navigation Tabs */}
          <div className="flex items-center gap-2 sm:gap-6 border-t border-zinc-800/80 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('atletas')}
              className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'atletas'
                  ? 'border-[#E50914] text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-4 h-4 text-[#E50914]" />
              <span>Lista de Atletas ({athletes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rutinas')}
              className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'rutinas'
                  ? 'border-[#E50914] text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Video className="w-4 h-4 text-[#E50914]" />
              <span>Rutinas & Videos por Semana</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendario')}
              className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'calendario'
                  ? 'border-[#E50914] text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-[#E50914]" />
              <span>Calendario de Sesiones</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Auth Status Notice if not signed in as Coach Google Account */}
        {!isAdminAuthenticated && (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">
                  Modo Gestión Administrador · Titan Forge
                </div>
                <div className="text-zinc-400">
                  Conecta la cuenta oficial ({trainerEmail}) para sincronizar sesiones directamente con Google Calendar.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSyncGoogleCalendar}
              className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shrink-0"
            >
              Conectar Google Coach
            </button>
          </div>
        )}

        {/* Executive Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Atletas Registrados
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {athletes.length}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
              {athletes.filter((a) => a.status === 'Activo').length} activos en programa
            </div>
          </div>

          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Próximas Fechas de Pago
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#E50914] mt-1">
              {athletes.filter((a) => a.status === 'Por vencer').length}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Atletas próximos a su fecha de renovación
            </div>
          </div>

          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Videos de Rutina (3 Niveles)
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {totalRoutineVideos}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Fundation · Performance · Elite
            </div>
          </div>

          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Sesiones Personalizadas
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {sessions.filter((s) => s.status !== 'Cancelada').length}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
              {sessions.filter((s) => s.status === 'Confirmada').length} confirmadas en agenda
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: LISTA DE ATLETAS (SOLO FECHA DE PAGO, SIN DATOS DE PAGO)   */}
        {/* ================================================================= */}
        {activeTab === 'atletas' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                  Directorio de Atletas
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visualiza los datos personales, plan asignado, objetivos y fecha de pago de cada atleta (datos bancarios y montos restringidos por privacidad).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewAthleteModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/25 cursor-pointer shrink-0 self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Atleta</span>
              </button>
            </div>

            {/* Search & Plan Filters */}
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={athleteSearch}
                  onChange={(e) => setAthleteSearch(e.target.value)}
                  placeholder="Buscar por nombre, correo, ID (#TF-...) u objetivo..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-600 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['Todos', 'Fundation', 'Performance', 'Elite'] as const).map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setPlanFilter(plan)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      planFilter === plan
                        ? 'bg-[#E50914] text-white'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>

            {/* Athletes Table (Desktop) */}
            <div className="hidden lg:block bg-[#141414] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    <th className="py-3.5 px-5">Atleta / ID</th>
                    <th className="py-3.5 px-4">Contacto</th>
                    <th className="py-3.5 px-4">Plan & Estado</th>
                    <th className="py-3.5 px-4">Objetivo Deportivo</th>
                    <th className="py-3.5 px-4">Fecha de Pago</th>
                    <th className="py-3.5 px-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70 text-xs">
                  {filteredAthletes.map((athlete) => (
                    <tr
                      key={athlete.id}
                      className="hover:bg-zinc-900/60 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-white font-black text-xs flex items-center justify-center uppercase shrink-0">
                            {athlete.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">
                              {athlete.fullName}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-400">
                              {athlete.membershipId}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        <div className="text-zinc-200 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{athlete.email}</span>
                        </div>
                        <div className="text-zinc-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{athlete.phone}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 space-y-1.5">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] font-black text-[11px] uppercase">
                            {athlete.planName}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              athlete.status === 'Activo'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : athlete.status === 'Por vencer'
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            ● {athlete.status}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-zinc-300 line-clamp-2 leading-snug">
                          {athlete.goal}
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 inline-block">
                          <div className="text-[10px] uppercase font-bold text-zinc-500">
                            Día de Pago
                          </div>
                          <div className="font-bold text-white">
                            Día {athlete.paymentDayOfMonth} de cada mes
                          </div>
                          <div className="text-[11px] text-[#E50914] font-semibold">
                            Próx: {athlete.nextPaymentDate}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedAthlete(athlete)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-[11px] cursor-pointer transition-colors"
                          >
                            Ver Ficha
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingAthlete(athlete)}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-[#E50914] border border-zinc-700 hover:border-[#E50914] text-zinc-300 hover:text-white cursor-pointer transition-colors"
                            title="Editar datos y fecha de pago"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAthletes.length === 0 && (
                <div className="py-12 text-center text-sm text-zinc-500">
                  No se encontraron atletas con los filtros aplicados.
                </div>
              )}
            </div>

            {/* Athletes Cards (Mobile & Tablet) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {filteredAthletes.map((athlete) => (
                <div
                  key={athlete.id}
                  className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-zinc-800 border border-zinc-700 text-white font-black text-xs flex items-center justify-center uppercase shrink-0">
                        {athlete.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{athlete.fullName}</div>
                        <div className="text-[11px] font-mono text-zinc-400">
                          {athlete.membershipId} · {athlete.planName}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        athlete.status === 'Activo'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {athlete.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{athlete.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{athlete.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                      <span className="text-zinc-400">{athlete.goal}</span>
                    </div>
                  </div>

                  {/* Strictly ONLY payment date */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-zinc-500">
                        Fecha de Pago Mensual
                      </div>
                      <div className="font-bold text-white">
                        Día {athlete.paymentDayOfMonth} · {athlete.nextPaymentDate}
                      </div>
                    </div>
                    <CalendarIcon className="w-4 h-4 text-[#E50914] shrink-0" />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAthlete(athlete)}
                      className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Ver Ficha
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAthlete(athlete)}
                      className="flex-1 py-2 rounded-xl bg-[#E50914]/15 hover:bg-[#E50914] border border-[#E50914]/40 text-[#E50914] hover:text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      Editar Fecha / Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: SUBIR VIDEOS DE RUTINA POR DÍA, AJUSTAR SEMANAS & DESC.    */}
        {/* ================================================================= */}
        {activeTab === 'rutinas' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                  Gestor de Rutinas & Videoteca por Nivel (Semanas 1 a 4)
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Selecciona el nivel (Fundation, Performance o Elite), administra cada semana y día, y sube o ajusta los videos y descripciones técnicas.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewVideoModal}
                className="px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/25 cursor-pointer shrink-0 self-start md:self-auto"
              >
                <Upload className="w-4 h-4" />
                <span>Subir Video a {selectedLevel}</span>
              </button>
            </div>

            {/* Level Selector (Fundation, Performance, Elite) */}
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>1. Selecciona el Nivel del Programa</span>
                </span>
                <span className="text-[11px] font-bold text-white bg-[#E50914]/15 border border-[#E50914]/40 px-2.5 py-0.5 rounded-full">
                  Editando: {selectedLevel}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PROGRAM_LEVELS.map((lvl) => {
                  const isLvlSelected = lvl.key === selectedLevel;
                  const lvlWeeks = weeksByLevel[lvl.key] || [];
                  const lvlVideoCount = lvlWeeks.reduce(
                    (sum, w) => sum + w.days.reduce((dSum, d) => dSum + d.exercises.length, 0),
                    0
                  );
                  return (
                    <button
                      key={lvl.key}
                      type="button"
                      onClick={() => selectLevel(lvl.key)}
                      className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                        isLvlSelected
                          ? 'bg-gradient-to-br from-[#1f1213] to-[#141414] border-[#E50914] ring-2 ring-[#E50914]/30 shadow-xl'
                          : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-sm font-black uppercase tracking-wide ${
                            isLvlSelected ? 'text-white' : 'text-zinc-200'
                          }`}
                        >
                          {lvl.label}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isLvlSelected
                              ? 'bg-[#E50914] text-white'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {lvlVideoCount} videos
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-[#E50914] mb-1">
                        {lvl.badge}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                        {lvl.focus}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Week Selector Cards (Semana 1 a 4) */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-black uppercase tracking-wider text-zinc-400 px-1">
                2. Semanas del Nivel <span className="text-white">{selectedLevel}</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {weeksData.map((week) => {
                const isSelected = week.weekNumber === adminWeekNum;
                const videoCount = week.days.reduce(
                  (acc, d) => acc + d.exercises.length,
                  0
                );
                return (
                  <button
                    key={week.weekNumber}
                    type="button"
                    onClick={() => selectWeek(week.weekNumber)}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#181818] border-[#E50914] ring-2 ring-[#E50914]/30 shadow-xl'
                        : 'bg-[#141414] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-[#E50914] text-white'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        Semana {week.weekNumber}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400">
                        {videoCount} videos
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white line-clamp-1">
                      {week.phaseName}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                      {week.days.length} día(s) · {week.rirTarget}
                    </div>
                  </button>
                );
              })}
              </div>
            </div>

            {/* Week Routine Description & Coach Advice Editor */}
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#E50914]" />
                  <div>
                    <h2 className="font-black text-base uppercase text-white">
                      Descripción General · {selectedLevel} · Semana {currentWeek.weekNumber}
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Visible para los atletas del plan {selectedLevel} al seleccionar la Semana {currentWeek.weekNumber} en su portal.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setWeekDraft(currentWeek);
                    setIsEditingWeekDesc(!isEditingWeekDesc);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>{isEditingWeekDesc ? 'Cancelar Edición' : 'Editar Descripción de Semana'}</span>
                </button>
              </div>

              {isEditingWeekDesc ? (
                <form onSubmit={handleSaveWeekDescription} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                        Título de la Semana
                      </label>
                      <input
                        type="text"
                        required
                        value={weekDraft.title}
                        onChange={(e) =>
                          setWeekDraft({ ...weekDraft, title: e.target.value })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                        Nombre de la Fase
                      </label>
                      <input
                        type="text"
                        required
                        value={weekDraft.phaseName}
                        onChange={(e) =>
                          setWeekDraft({ ...weekDraft, phaseName: e.target.value })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                        Objetivo de Intensidad (RIR)
                      </label>
                      <input
                        type="text"
                        value={weekDraft.rirTarget}
                        onChange={(e) =>
                          setWeekDraft({ ...weekDraft, rirTarget: e.target.value })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                        Volumen Objetivo
                      </label>
                      <input
                        type="text"
                        value={weekDraft.volumeTarget}
                        onChange={(e) =>
                          setWeekDraft({ ...weekDraft, volumeTarget: e.target.value })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Descripción de la Rutina Semanal
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={weekDraft.description}
                      onChange={(e) =>
                        setWeekDraft({ ...weekDraft, description: e.target.value })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
                      Instrucción / Consejo del Coach
                    </label>
                    <textarea
                      rows={2}
                      value={weekDraft.coachAdvice}
                      onChange={(e) =>
                        setWeekDraft({ ...weekDraft, coachAdvice: e.target.value })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Descripción de Semana</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                  <div className="lg:col-span-2 space-y-2">
                    <div className="font-bold text-white text-base">{currentWeek.title}</div>
                    <p className="text-zinc-300 leading-relaxed">{currentWeek.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg text-zinc-300">
                        Intensidad: <strong className="text-white">{currentWeek.rirTarget}</strong>
                      </span>
                      <span className="bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-lg text-zinc-300">
                        Volumen: <strong className="text-white">{currentWeek.volumeTarget}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-1">
                    <div className="text-[10px] font-black uppercase text-[#E50914]">
                      Nota del Coach
                    </div>
                    <p className="text-zinc-300 italic leading-snug">
                      "{currentWeek.coachAdvice}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Day Selector + Day Description + Exercises with Videos */}
            <div className="space-y-5">
              {/* Day Tabs Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {currentWeek.days.map((day) => {
                    const active = currentDay?.dayNumber === day.dayNumber;
                    return (
                      <button
                        key={day.dayNumber}
                        type="button"
                        onClick={() => selectDay(day)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          active
                            ? 'bg-[#E50914] border-[#E50914] text-white shadow-md shadow-red-600/20'
                            : 'bg-[#141414] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        Día {day.dayNumber} ({day.exercises.length} videos)
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleAddDayToWeek}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>Agregar Día</span>
                  </button>
                </div>
              </div>

              {/* Active Day Header & Description */}
              {currentDay && (
                <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                    <div>
                      <div className="text-[10px] font-black uppercase text-[#E50914] tracking-wider">
                        Nivel {selectedLevel} · Semana {currentWeek.weekNumber} · Día {currentDay.dayNumber}
                      </div>
                      <h3 className="text-lg font-black text-white mt-0.5">
                        {currentDay.dayName}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {currentDay.focus} · Duración estimada: {currentDay.estimatedDuration}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setDayDraft({
                            dayName: currentDay.dayName,
                            focus: currentDay.focus,
                            estimatedDuration: currentDay.estimatedDuration,
                          });
                          setIsEditingDayDesc(!isEditingDayDesc);
                        }}
                        className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Descripción Día</span>
                      </button>
                      <button
                        type="button"
                        onClick={openNewVideoModal}
                        className="px-3.5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Subir Video Aquí</span>
                      </button>
                    </div>
                  </div>

                  {isEditingDayDesc && (
                    <form
                      onSubmit={handleSaveDayDescription}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                            Nombre del Día
                          </label>
                          <input
                            type="text"
                            required
                            value={dayDraft.dayName}
                            onChange={(e) =>
                              setDayDraft({ ...dayDraft, dayName: e.target.value })
                            }
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#E50914]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                            Duración
                          </label>
                          <input
                            type="text"
                            value={dayDraft.estimatedDuration}
                            onChange={(e) =>
                              setDayDraft({
                                ...dayDraft,
                                estimatedDuration: e.target.value,
                              })
                            }
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#E50914]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                          Descripción / Enfoque del Día
                        </label>
                        <input
                          type="text"
                          required
                          value={dayDraft.focus}
                          onChange={(e) =>
                            setDayDraft({ ...dayDraft, focus: e.target.value })
                          }
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#E50914]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingDayDesc(false)}
                          className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-[#E50914] text-white text-xs font-bold cursor-pointer"
                        >
                          Guardar Día
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Exercises Video Grid */}
                  {currentDay.exercises.length === 0 ? (
                    <div className="bg-zinc-950 border border-dashed border-zinc-800 rounded-2xl p-10 text-center space-y-3">
                      <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto" />
                      <div className="text-sm font-bold text-zinc-300">
                        Este día aún no tiene videos de rutina asignados
                      </div>
                      <button
                        type="button"
                        onClick={openNewVideoModal}
                        className="px-4 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold uppercase inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Primer Video del Día</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {currentDay.exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between"
                        >
                          {/* Thumbnail + Play Preview */}
                          <div className="relative aspect-video bg-black group">
                            {isDirectVideoFile(exercise.videoUrl) ? (
                              <video
                                src={exercise.videoUrl}
                                muted
                                className="w-full h-full object-cover opacity-80"
                              />
                            ) : (
                              <img
                                src={exercise.videoThumbnail}
                                alt={exercise.name}
                                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                            <button
                              type="button"
                              onClick={() => setPreviewVideoExercise(exercise)}
                              className="absolute inset-0 flex items-center justify-center cursor-pointer"
                            >
                              <div className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-xl pl-0.5 group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 fill-white" />
                              </div>
                            </button>

                            <div className="absolute top-3 left-3 flex items-center gap-2">
                              <span className="bg-black/80 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-white/20 text-white">
                                {exercise.category}
                              </span>
                              {exercise.isUploadedFile && (
                                <span className="bg-emerald-600/90 text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white">
                                  Video Subido
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Exercise Metadata & Actions */}
                          <div className="p-4 space-y-3">
                            <div>
                              <h4 className="font-black text-sm uppercase text-white">
                                {exercise.name}
                              </h4>
                              <div className="text-[11px] text-zinc-400">
                                {exercise.setsReps} · {exercise.rir} · Descanso: {exercise.rest}
                              </div>
                            </div>

                            <div className="text-[11px] text-zinc-300 bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 space-y-1">
                              <div className="font-bold text-zinc-400 uppercase text-[10px]">
                                Descripción técnica:
                              </div>
                              {exercise.technicalTips.slice(0, 2).map((tip, i) => (
                                <div key={i} className="flex items-start gap-1.5">
                                  <span className="text-[#E50914]">▸</span>
                                  <span>{tip}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/80">
                              <button
                                type="button"
                                onClick={() => openEditVideoModal(exercise)}
                                className="flex-1 py-2 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openAdjustWeeksModal(exercise)}
                                className="flex-1 py-2 px-2.5 rounded-lg bg-[#E50914]/15 hover:bg-[#E50914] border border-[#E50914]/40 text-[#E50914] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Ajustar Semanas</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteExercise(exercise.id)}
                                className="p-2 rounded-lg bg-zinc-900 hover:bg-red-950 border border-zinc-800 hover:border-red-800 text-zinc-400 hover:text-red-400 cursor-pointer"
                                title="Eliminar ejercicio"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: CALENDARIO CON AGENDAS DE SESIONES PERSONALIZADAS          */}
        {/* ================================================================= */}
        {activeTab === 'calendario' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                  Calendario & Agenda de Sesiones Personalizadas
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visualiza todas las citas presenciales agendadas por tus atletas, sincroniza con Google Calendar y gestiona la agenda diaria.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSyncGoogleCalendar}
                  disabled={isSyncingGCal}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#E50914] ${isSyncingGCal ? 'animate-spin' : ''}`} />
                  <span>{isSyncingGCal ? 'Sincronizando...' : 'Sincronizar Google Calendar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewSessionForm((prev) => ({ ...prev, date: selectedCalendarDate }));
                    setShowAddSessionModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/25 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agendar Sesión</span>
                </button>
              </div>
            </div>

            {/* Cuenta Gmail / Correo del Calendario */}
            <form
              onSubmit={handleSaveCalendarEmail}
              className="bg-[#141414] border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-[#E50914]" />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-wide text-white">
                      Cuenta Gmail / Correo del Calendario
                    </h2>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Activo: {trainerEmail}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Define el correo o cuenta Gmail donde se consultarán y recibirán las reservas de sesiones personalizadas.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 lg:min-w-[440px]">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={calendarEmailInput}
                      onChange={(e) => {
                        setCalendarEmailInput(e.target.value);
                        if (calendarEmailError) setCalendarEmailError(null);
                      }}
                      placeholder="tucorreo@gmail.com"
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-[#E50914] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer shrink-0 transition-all active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Correo</span>
                  </button>
                  <a
                    href={`https://calendar.google.com/calendar/r?authuser=${encodeURIComponent(trainerEmail)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors"
                    title="Abrir Google Calendar en nueva pestaña"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>Abrir Calendar</span>
                  </a>
                </div>
              </div>

              {calendarEmailError && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{calendarEmailError}</span>
                </div>
              )}

              {user?.email && user.email.toLowerCase() !== trainerEmail.toLowerCase() && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2">
                  <span>
                    Tu sesión actual de Google es <strong>{user.email}</strong>. Si el calendario de <strong>{trainerEmail}</strong> no está compartido con esa cuenta, inicia sesión con <strong>{trainerEmail}</strong> para sincronizarlo.
                  </span>
                  <button
                    type="button"
                    onClick={handleSyncGoogleCalendar}
                    className="text-white font-bold underline underline-offset-2 hover:text-[#E50914] cursor-pointer"
                  >
                    Probar sincronización ahora
                  </button>
                </div>
              )}
            </form>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {(['Todas', 'Confirmada', 'Pendiente', 'Completada'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSessionFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    sessionFilter === st
                      ? 'bg-[#E50914] text-white'
                      : 'bg-[#141414] border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Monthly Interactive Calendar (7 cols) */}
              <div className="lg:col-span-7 bg-[#141414] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base sm:text-lg font-black uppercase text-white">
                    {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                  </h2>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setCalendarMonth(now);
                        setSelectedCalendarDate(now.toISOString().split('T')[0]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 cursor-pointer"
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth((prev) => {
                          const d = new Date(prev);
                          d.setMonth(d.getMonth() - 1);
                          return d;
                        })
                      }
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth((prev) => {
                          const d = new Date(prev);
                          d.setMonth(d.getMonth() + 1);
                          return d;
                        })
                      }
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-black uppercase text-zinc-500 mb-2">
                  <span>Lu</span>
                  <span>Ma</span>
                  <span>Mi</span>
                  <span>Ju</span>
                  <span>Vi</span>
                  <span>Sá</span>
                  <span>Do</span>
                </div>

                {/* Calendar Cells */}
                <div className="grid grid-cols-7 gap-1.5">
                  {monthDays.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className="h-18 sm:h-22 rounded-xl bg-zinc-950/30" />;
                    }
                    const y = day.getFullYear();
                    const m = String(day.getMonth() + 1).padStart(2, '0');
                    const dNum = String(day.getDate()).padStart(2, '0');
                    const iso = `${y}-${m}-${dNum}`;
                    const daySessions = visibleSessions.filter((s) => s.date === iso);
                    const isSelected = iso === selectedCalendarDate;
                    const isToday = iso === new Date().toISOString().split('T')[0];

                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setSelectedCalendarDate(iso)}
                        className={`h-18 sm:h-22 p-1.5 sm:p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer overflow-hidden ${
                          isSelected
                            ? 'bg-[#E50914]/15 border-[#E50914] ring-1 ring-[#E50914]/50'
                            : isToday
                            ? 'bg-zinc-900 border-zinc-600'
                            : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-xs font-bold ${
                              isSelected
                                ? 'text-[#E50914]'
                                : isToday
                                ? 'text-white underline'
                                : 'text-zinc-300'
                            }`}
                          >
                            {day.getDate()}
                          </span>
                          {daySessions.length > 0 && (
                            <span className="w-5 h-5 rounded-full bg-[#E50914] text-white text-[10px] font-black flex items-center justify-center">
                              {daySessions.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-0.5 w-full hidden sm:block">
                          {daySessions.slice(0, 2).map((ds) => (
                            <div
                              key={ds.id}
                              className="text-[9px] truncate px-1 py-0.5 rounded bg-zinc-900 text-zinc-200 border border-zinc-800"
                            >
                              {ds.timeSlot.split(' - ')[0]} {ds.athleteName.split(' ')[0]}
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Daily Agenda & Upcoming Sessions (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* Selected Date Sessions */}
                <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <div className="text-[10px] font-black uppercase text-[#E50914] tracking-wider">
                        Agenda del Día Seleccionado
                      </div>
                      <h3 className="text-base font-black text-white mt-0.5">
                        {selectedCalendarDate}
                      </h3>
                    </div>
                    <span className="text-xs font-bold bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-zinc-300">
                      {sessionsForSelectedDay.length} sesión(es)
                    </span>
                  </div>

                  {sessionsForSelectedDay.length === 0 ? (
                    <div className="py-8 text-center space-y-2.5">
                      <CalendarIcon className="w-8 h-8 text-zinc-700 mx-auto" />
                      <div className="text-xs text-zinc-400">
                        No hay sesiones personalizadas agendadas para el {selectedCalendarDate}.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewSessionForm((prev) => ({ ...prev, date: selectedCalendarDate }));
                          setShowAddSessionModal(true);
                        }}
                        className="text-xs font-bold text-[#E50914] hover:underline cursor-pointer"
                      >
                        + Agendar una sesión para este día
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessionsForSelectedDay.map((sess) => (
                        <div
                          key={sess.id}
                          className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#E50914] bg-[#E50914]/15 px-2.5 py-1 rounded-lg">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{sess.timeSlot}</span>
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                              {sess.source}
                            </span>
                          </div>

                          <div>
                            <div className="font-bold text-sm text-white">
                              {sess.athleteName}
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              {sess.athleteEmail} · {sess.athletePhone}
                            </div>
                          </div>

                          <div className="text-xs text-zinc-300 bg-zinc-900/70 p-2.5 rounded-lg border border-zinc-800/80 space-y-1">
                            <div className="font-bold text-white text-[11px]">
                              {sess.planTitle}
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              Objetivo: {sess.goal}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                sess.status === 'Confirmada'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : sess.status === 'Completada'
                                  ? 'bg-blue-500/15 text-blue-400'
                                  : sess.status === 'Pendiente'
                                  ? 'bg-amber-500/15 text-amber-400'
                                  : 'bg-red-500/15 text-red-400'
                              }`}
                            >
                              {sess.status}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {sess.status !== 'Completada' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSessionStatus(sess.id, 'Completada')
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[10px] font-bold cursor-pointer"
                                >
                                  Completar
                                </button>
                              )}
                              {sess.status !== 'Cancelada' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSessionStatus(sess.id, 'Cancelada')
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 text-[10px] font-bold cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Sessions Quick List */}
                <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-zinc-300">
                    Próximas Sesiones en Agenda
                  </div>
                  <div className="space-y-2">
                    {upcomingSessions.map((up) => (
                      <button
                        key={up.id}
                        type="button"
                        onClick={() => setSelectedCalendarDate(up.date)}
                        className="w-full text-left bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate">
                            {up.athleteName}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {up.date} · {up.timeSlot}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#E50914] shrink-0">
                          Ver →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL: VER FICHA DE ATLETA (SIN DATOS DE PAGO, SOLO FECHA DE PAGO)  */}
      {/* =================================================================== */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedAthlete(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
              <div className="w-12 h-12 rounded-full bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914] font-black text-base flex items-center justify-center uppercase">
                {selectedAthlete.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {selectedAthlete.fullName}
                </h3>
                <div className="text-xs text-zinc-400 font-mono">
                  {selectedAthlete.membershipId} · Plan {selectedAthlete.planName}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Correo electrónico:</span>
                <span className="text-white font-semibold">{selectedAthlete.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Teléfono / WhatsApp:</span>
                <span className="text-white font-semibold">{selectedAthlete.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Fecha de inscripción:</span>
                <span className="text-white font-semibold">{selectedAthlete.enrollmentDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Día mensual de pago:</span>
                <span className="text-[#E50914] font-black">
                  Día {selectedAthlete.paymentDayOfMonth} de cada mes
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                <span className="text-zinc-400">Próxima fecha de pago:</span>
                <span className="text-white font-bold">{selectedAthlete.nextPaymentDate}</span>
              </div>
              <div className="py-1.5">
                <span className="text-zinc-400 block mb-1">Objetivo deportivo:</span>
                <p className="text-zinc-200 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  {selectedAthlete.goal}
                </p>
              </div>
              {selectedAthlete.notes && (
                <div className="py-1">
                  <span className="text-zinc-400 block mb-1">Notas técnicas del coach:</span>
                  <p className="text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    {selectedAthlete.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedAthlete;
                  setSelectedAthlete(null);
                  setEditingAthlete(target);
                }}
                className="px-4 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold cursor-pointer"
              >
                Editar Datos / Fecha de Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDITAR ATLETA & FECHA DE PAGO                                */}
      {/* =================================================================== */}
      {editingAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveAthleteEdit}
            className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setEditingAthlete(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black uppercase text-white">
              Editar Atleta · {editingAthlete.fullName}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Plan
                </label>
                <select
                  value={editingAthlete.planName}
                  onChange={(e) =>
                    setEditingAthlete({
                      ...editingAthlete,
                      planName: e.target.value as AthleteRecord['planName'],
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                >
                  <option value="Fundation">Fundation</option>
                  <option value="Performance">Performance</option>
                  <option value="Elite">Elite</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Estado
                </label>
                <select
                  value={editingAthlete.status}
                  onChange={(e) =>
                    setEditingAthlete({
                      ...editingAthlete,
                      status: e.target.value as AthleteRecord['status'],
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                >
                  <option value="Activo">Activo</option>
                  <option value="Por vencer">Por vencer</option>
                  <option value="Pausado">Pausado</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Día de Pago (1–28)
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={editingAthlete.paymentDayOfMonth}
                  onChange={(e) =>
                    setEditingAthlete({
                      ...editingAthlete,
                      paymentDayOfMonth: Number(e.target.value),
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Próxima Fecha de Pago
                </label>
                <input
                  type="text"
                  value={editingAthlete.nextPaymentDate}
                  onChange={(e) =>
                    setEditingAthlete({
                      ...editingAthlete,
                      nextPaymentDate: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Objetivo Deportivo
              </label>
              <input
                type="text"
                value={editingAthlete.goal}
                onChange={(e) =>
                  setEditingAthlete({ ...editingAthlete, goal: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
              />
            </div>

            <div className="text-xs">
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Notas del Coach
              </label>
              <textarea
                rows={2}
                value={editingAthlete.notes || ''}
                onChange={(e) =>
                  setEditingAthlete({ ...editingAthlete, notes: e.target.value })
                }
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAthlete(null)}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: REGISTRAR NUEVO ATLETA                                       */}
      {/* =================================================================== */}
      {showNewAthleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateAthlete}
            className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setShowNewAthleteModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black uppercase text-white">
              Registrar Nuevo Atleta
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newAthleteForm.fullName}
                  onChange={(e) =>
                    setNewAthleteForm({ ...newAthleteForm, fullName: e.target.value })
                  }
                  placeholder="Ej. Andrés Morales"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Correo *
                  </label>
                  <input
                    type="email"
                    required
                    value={newAthleteForm.email}
                    onChange={(e) =>
                      setNewAthleteForm({ ...newAthleteForm, email: e.target.value })
                    }
                    placeholder="atleta@correo.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={newAthleteForm.phone}
                    onChange={(e) =>
                      setNewAthleteForm({ ...newAthleteForm, phone: e.target.value })
                    }
                    placeholder="+52 55 0000 0000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Plan
                  </label>
                  <select
                    value={newAthleteForm.planName}
                    onChange={(e) =>
                      setNewAthleteForm({
                        ...newAthleteForm,
                        planName: e.target.value as AthleteRecord['planName'],
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                  >
                    <option value="Fundation">Fundation</option>
                    <option value="Performance">Performance</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Día de Pago
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={28}
                    value={newAthleteForm.paymentDayOfMonth}
                    onChange={(e) =>
                      setNewAthleteForm({
                        ...newAthleteForm,
                        paymentDayOfMonth: Number(e.target.value),
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Próxima Fecha Pago
                  </label>
                  <input
                    type="text"
                    value={newAthleteForm.nextPaymentDate}
                    onChange={(e) =>
                      setNewAthleteForm({
                        ...newAthleteForm,
                        nextPaymentDate: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Objetivo Deportivo
                </label>
                <input
                  type="text"
                  value={newAthleteForm.goal}
                  onChange={(e) =>
                    setNewAthleteForm({ ...newAthleteForm, goal: e.target.value })
                  }
                  placeholder="Ej. Ganancia de masa muscular y fuerza en tren inferior"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewAthleteModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold cursor-pointer"
              >
                Registrar Atleta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: SUBIR / EDITAR VIDEO DE RUTINA POR DÍA Y AJUSTAR A SEMANAS   */}
      {/* =================================================================== */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveExerciseVideo}
            className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 relative shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="text-[10px] font-black uppercase text-[#E50914] tracking-wider">
                Biblioteca de Rutinas · Nivel {selectedLevel}
              </div>
              <h3 className="text-lg font-black uppercase text-white">
                {editingExerciseId ? 'Editar Video y Rutina' : `Subir Video de Rutina (${selectedLevel})`}
              </h3>
            </div>

            {/* Video Source Toggle */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setVideoSourceType('file')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    videoSourceType === 'file'
                      ? 'bg-[#E50914] text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Archivo de Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSourceType('url')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    videoSourceType === 'url'
                      ? 'bg-[#E50914] text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Enlace YouTube / MP4</span>
                </button>
              </div>

              {videoSourceType === 'file' ? (
                <label className="block border-2 border-dashed border-zinc-700 hover:border-[#E50914] bg-zinc-950 rounded-xl p-5 text-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-7 h-7 text-[#E50914] mx-auto mb-2" />
                  {exerciseForm.uploadedFileName ? (
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-emerald-400">
                        ✓ Archivo cargado: {exerciseForm.uploadedFileName}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Haz clic para reemplazar el video
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">
                        Haz clic para seleccionar el video de tu rutina (.MP4, .MOV, .WEBM)
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Se reproducirá directamente en el Portal del Atleta
                      </div>
                    </div>
                  )}
                </label>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400">
                    URL del Video (YouTube o MP4 directo)
                  </label>
                  <input
                    type="url"
                    value={exerciseForm.videoUrl}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, videoUrl: e.target.value })
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>
              )}
            </div>

            {/* Exercise Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Nombre del Ejercicio *
                </label>
                <input
                  type="text"
                  required
                  value={exerciseForm.name}
                  onChange={(e) =>
                    setExerciseForm({ ...exerciseForm, name: e.target.value })
                  }
                  placeholder="Ej. Sentadilla Frontal con Barra"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Categoría
                </label>
                <select
                  value={exerciseForm.category}
                  onChange={(e) =>
                    setExerciseForm({
                      ...exerciseForm,
                      category: e.target.value as ExerciseVideoItem['category'],
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-white outline-none"
                >
                  <option value="Fuerza">Fuerza</option>
                  <option value="Potencia">Potencia</option>
                  <option value="Movilidad">Movilidad</option>
                  <option value="Metabólico">Metabólico</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Series x Repeticiones
                </label>
                <input
                  type="text"
                  value={exerciseForm.setsReps}
                  onChange={(e) =>
                    setExerciseForm({ ...exerciseForm, setsReps: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    RIR / Intensidad
                  </label>
                  <input
                    type="text"
                    value={exerciseForm.rir}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, rir: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3 py-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Descanso
                  </label>
                  <input
                    type="text"
                    value={exerciseForm.rest}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, rest: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3 py-2.5 text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Grupo Muscular
                </label>
                <input
                  type="text"
                  value={exerciseForm.muscleGroup}
                  onChange={(e) =>
                    setExerciseForm({ ...exerciseForm, muscleGroup: e.target.value })
                  }
                  placeholder="Ej. Cuádriceps, glúteo mayor, core"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Errores a Evitar
                </label>
                <input
                  type="text"
                  value={exerciseForm.commonMistakes}
                  onChange={(e) =>
                    setExerciseForm({ ...exerciseForm, commonMistakes: e.target.value })
                  }
                  placeholder="Ej. Colapsar rodillas hacia adentro"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                Descripción de la Rutina & Puntos Técnicos Clave (uno por línea)
              </label>
              <textarea
                rows={3}
                value={exerciseForm.technicalTipsText}
                onChange={(e) =>
                  setExerciseForm({
                    ...exerciseForm,
                    technicalTipsText: e.target.value,
                  })
                }
                placeholder={'Retracción escapular completa.\nControlar 3 segundos la bajada.'}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#E50914] rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            {/* Assign Day & Adjust Across Weeks 1 to 4 */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase text-white">
                  Asignar por Día y Ajustar a las Semanas
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-400">Día:</span>
                  <select
                    value={targetDayNumber}
                    onChange={(e) => setTargetDayNumber(Number(e.target.value))}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-white font-bold outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((d) => (
                      <option key={d} value={d}>
                        Día {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((wNum) => {
                  const checked = selectedTargetWeeks.includes(wNum);
                  return (
                    <button
                      key={wNum}
                      type="button"
                      onClick={() => toggleTargetWeek(wNum)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        checked
                          ? 'bg-[#E50914]/20 border-[#E50914] text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${checked ? 'text-[#E50914]' : 'opacity-30'}`} />
                      <span>Semana {wNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 text-xs text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c90812] text-white text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {editingExerciseId ? 'Guardar Cambios' : 'Guardar y Publicar Video'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: AJUSTAR EJERCICIO EXISTENTE ENTRE SEMANAS 1-4                */}
      {/* =================================================================== */}
      {adjustWeeksExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setAdjustWeeksExercise(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="text-[10px] font-black uppercase text-[#E50914]">
                Ajustar Planificación Semanal · Nivel {selectedLevel}
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                {adjustWeeksExercise.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Selecciona en qué semanas (1 a 4) y en qué día del nivel <strong>{selectedLevel}</strong> debe aparecer este video de rutina.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-300 font-bold">Día de entrenamiento:</span>
              <select
                value={adjustDayTarget}
                onChange={(e) => setAdjustDayTarget(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white font-bold outline-none"
              >
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    Día {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[1, 2, 3, 4].map((wNum) => {
                const active = adjustWeekTargets.includes(wNum);
                return (
                  <button
                    key={wNum}
                    type="button"
                    onClick={() =>
                      setAdjustWeekTargets((prev) =>
                        prev.includes(wNum)
                          ? prev.length > 1
                            ? prev.filter((x) => x !== wNum)
                            : prev
                          : [...prev, wNum].sort((a, b) => a - b)
                      )
                    }
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer ${
                      active
                        ? 'bg-[#E50914]/20 border-[#E50914] text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${active ? 'text-[#E50914]' : 'opacity-25'}`} />
                    <span>Semana {wNum}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustWeeksExercise(null)}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyWeekAdjustment}
                className="px-5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold cursor-pointer"
              >
                Aplicar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: PREVISUALIZAR VIDEO DE RUTINA                                */}
      {/* =================================================================== */}
      {previewVideoExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewVideoExercise(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="text-[10px] font-bold uppercase text-[#E50914]">
                Previsualización de Coach
              </div>
              <h3 className="text-lg font-black uppercase text-white">
                {previewVideoExercise.name}
              </h3>
            </div>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800">
              {isDirectVideoFile(previewVideoExercise.videoUrl) ? (
                <video
                  src={previewVideoExercise.videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={previewVideoExercise.videoUrl}
                  title={previewVideoExercise.name}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: AGENDAR SESIÓN MANUAL EN CALENDARIO                          */}
      {/* =================================================================== */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateManualSession}
            className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowAddSessionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black uppercase text-white">
              Agendar Sesión Personalizada
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  required
                  value={newSessionForm.date}
                  onChange={(e) =>
                    setNewSessionForm({ ...newSessionForm, date: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Horario *
                </label>
                <select
                  value={newSessionForm.timeSlot}
                  onChange={(e) =>
                    setNewSessionForm({ ...newSessionForm, timeSlot: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                >
                  <option value="07:00 - 08:00">07:00 - 08:00</option>
                  <option value="08:30 - 09:30">08:30 - 09:30</option>
                  <option value="10:00 - 11:00">10:00 - 11:00</option>
                  <option value="11:30 - 12:30">11:30 - 12:30</option>
                  <option value="16:00 - 17:00">16:00 - 17:00</option>
                  <option value="17:30 - 18:30">17:30 - 18:30</option>
                  <option value="19:00 - 20:00">19:00 - 20:00</option>
                </select>
              </div>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Atleta *
                </label>
                <input
                  type="text"
                  required
                  value={newSessionForm.athleteName}
                  onChange={(e) =>
                    setNewSessionForm({ ...newSessionForm, athleteName: e.target.value })
                  }
                  placeholder="Nombre del atleta"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={newSessionForm.athleteEmail}
                    onChange={(e) =>
                      setNewSessionForm({
                        ...newSessionForm,
                        athleteEmail: e.target.value,
                      })
                    }
                    placeholder="atleta@correo.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={newSessionForm.athletePhone}
                    onChange={(e) =>
                      setNewSessionForm({
                        ...newSessionForm,
                        athletePhone: e.target.value,
                      })
                    }
                    placeholder="+52 55 0000 0000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Objetivo de la Sesión
                </label>
                <input
                  type="text"
                  value={newSessionForm.goal}
                  onChange={(e) =>
                    setNewSessionForm({ ...newSessionForm, goal: e.target.value })
                  }
                  placeholder="Ej. Técnica de sentadilla y descarga activa"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#E50914]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSessionModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold cursor-pointer"
              >
                Guardar en Calendario
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
