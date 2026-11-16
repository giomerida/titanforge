export interface ExerciseVideoItem {
  id: string;
  name: string;
  category: 'Fuerza' | 'Potencia' | 'Movilidad' | 'Metabólico';
  setsReps: string;
  rir: string;
  rest: string;
  videoUrl: string; // Embed URL, MP4 URL, or local uploaded video URL
  videoThumbnail: string;
  technicalTips: string[];
  muscleGroup: string;
  commonMistakes: string;
  isUploadedFile?: boolean;
  uploadedFileName?: string;
}

export interface WorkoutDay {
  dayNumber: number;
  dayName: string;
  focus: string;
  estimatedDuration: string;
  exercises: ExerciseVideoItem[];
}

export interface WeekPlan {
  weekNumber: number;
  title: string;
  phaseName: string;
  rirTarget: string;
  volumeTarget: string;
  description: string;
  coachAdvice: string;
  days: WorkoutDay[];
}

export interface AthleteRecord {
  id: string;
  membershipId: string;
  fullName: string;
  email: string;
  phone: string;
  planName: 'Fundation' | 'Performance' | 'Elite';
  goal: string;
  status: 'Activo' | 'Por vencer' | 'Pausado';
  enrollmentDate: string; // YYYY-MM-DD
  paymentDayOfMonth: number; // e.g., 10
  nextPaymentDate: string; // e.g., '2026-12-10' or formatted string
  assignedCoach: string;
  notes?: string;
}

export interface ScheduledSession {
  id: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., '08:30 - 09:30'
  athleteName: string;
  athleteEmail: string;
  athletePhone: string;
  planTitle: string;
  trainingType: 'presencial' | 'online';
  goal: string;
  status: 'Confirmada' | 'Completada' | 'Pendiente' | 'Cancelada';
  source: 'Sistema Web' | 'Google Calendar' | 'Admin Manual';
  notes?: string;
}

export type ProgramLevel = 'Fundation' | 'Performance' | 'Elite';

export type WeeksByLevel = Record<ProgramLevel, WeekPlan[]>;

export const PROGRAM_LEVELS: {
  key: ProgramLevel;
  label: string;
  badge: string;
  focus: string;
}[] = [
  {
    key: 'Fundation',
    label: 'Fundation',
    badge: 'Principiante · Base Técnica',
    focus: 'Control motor, técnica sólida y adaptación articular progresiva.',
  },
  {
    key: 'Performance',
    label: 'Performance',
    badge: 'Intermedio · Hipertrofia & Fuerza',
    focus: 'Sobrecarga progresiva, volumen estructural y potencia funcional.',
  },
  {
    key: 'Elite',
    label: 'Elite',
    badge: 'Avanzado · Alto Rendimiento',
    focus: 'Fuerza máxima, picos de potencia y densidad metabólica de élite.',
  },
];

const STORAGE_KEYS = {
  WEEKS: 'tf_admin_weeks_v1',
  WEEKS_BY_LEVEL: 'tf_admin_weeks_by_level_v1',
  ATHLETES: 'tf_admin_athletes_v1',
  SESSIONS: 'tf_admin_sessions_v1',
  CALENDAR_EMAIL: 'tf_admin_calendar_email_v1',
};

export const DEFAULT_CALENDAR_EMAIL = 'amauryuchiha@gmail.com';

/**
 * Normalizes YouTube watch/short/youtu.be URLs into embeddable URLs.
 * Passes through direct MP4, blob:, data:, or already-embedded URLs.
 */
export function normalizeVideoUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:') ||
    trimmed.includes('youtube.com/embed/') ||
    trimmed.includes('youtube-nocookie.com/embed/')
  ) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    let videoId = '';

    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.replace('/', '');
    } else if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.replace('/shorts/', '').split('/')[0];
      } else {
        videoId = parsed.searchParams.get('v') || '';
      }
    }

    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    }
  } catch {
    // Return as-is if not a standard URL
  }

  return trimmed;
}

export function isDirectVideoFile(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.startsWith('blob:') ||
    lower.startsWith('data:video/') ||
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.includes('.mp4?')
  );
}

export const DEFAULT_WEEKS_DATA: WeekPlan[] = [
  {
    weekNumber: 1,
    title: 'Semana 1: Adaptación Neuromuscular & Patrones Base',
    phaseName: 'Fase de Calibración',
    rirTarget: 'RIR 3–4 (Esfuerzo moderado)',
    volumeTarget: '3 series efectivas por patrón motor',
    description:
      'Semana de ajuste neuromuscular, evaluación de técnica en los ejercicios principales y calibración de cargas base sin llegar al fallo.',
    coachAdvice:
      'Prioriza el control del tempo excéntrico (3 segundos de bajada). No persigas récords esta semana; busca que cada repetición se sienta impecable.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Día 1: Tren Superior (Empuje & Tracción Base)',
        focus: 'Fuerza base en pectoral, dorsal y hombro con cadencia controlada',
        estimatedDuration: '60 min',
        exercises: [
          {
            id: 'w1-d1-e1',
            name: 'Press de Banca Plano con Barra',
            category: 'Fuerza',
            setsReps: '4 series x 6–8 repeticiones',
            rir: 'RIR 3',
            rest: '90–120 seg',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/rT7DgCr-3pg?autoplay=1&mute=1&loop=1&playlist=rT7DgCr-3pg',
            videoThumbnail:
              'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Retracción y depresión escapular completa antes de sacar la barra.',
              'Pausa de 1 segundo en el pecho manteniendo la tensión sin rebotar.',
              'Empuje firme clavando los talones contra el suelo (Leg Drive).',
            ],
            muscleGroup: 'Pectoral mayor, tríceps braquial, deltoides anterior',
            commonMistakes:
              'Despegar los glúteos del banco o abrir excesivamente los codos.',
          },
          {
            id: 'w1-d1-e2',
            name: 'Remo con Barra con Agarre Prono',
            category: 'Fuerza',
            setsReps: '4 series x 8–10 repeticiones',
            rir: 'RIR 3',
            rest: '90 seg',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/FWJR5Ve8gkQ?autoplay=1&mute=1&loop=1&playlist=FWJR5Ve8gkQ',
            videoThumbnail:
              'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Inclinación de torso a 45 grados manteniendo columna neutra.',
              'Tira con los codos hacia la cadera, apretando escápulas al final.',
              'Evita el tirón brusco con la zona lumbar.',
            ],
            muscleGroup: 'Dorsal ancho, romboides, trapecio medio, bíceps',
            commonMistakes:
              'Erguir el torso por exceso de peso o perder la lordosis neutra.',
          },
          {
            id: 'w1-d1-e3',
            name: 'Press Militar de Pie con Mancuernas',
            category: 'Fuerza',
            setsReps: '3 series x 10–12 repeticiones',
            rir: 'RIR 3',
            rest: '75 seg',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/qEwKCR5JCog?autoplay=1&mute=1&loop=1&playlist=qEwKCR5JCog',
            videoThumbnail:
              'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Glúteos y abdomen bien compactos para no hiperextender la zona lumbar.',
              'Trayectoria en arco natural terminando con los brazos alineados con las orejas.',
            ],
            muscleGroup: 'Deltoides anterior y lateral, tríceps, serrato anterior',
            commonMistakes:
              'Arquear la espalda baja en exceso al empujar hacia arriba.',
          },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Día 2: Tren Inferior & Dominancia de Cadera',
        focus: 'Patrones biomecánicos de sentadilla y bisagra de cadera',
        estimatedDuration: '65 min',
        exercises: [
          {
            id: 'w1-d2-e1',
            name: 'Sentadilla Trasera con Barra (Back Squat)',
            category: 'Fuerza',
            setsReps: '4 series x 6–8 repeticiones',
            rir: 'RIR 3',
            rest: '120 seg',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/MVMNk0HiTMg?autoplay=1&mute=1&loop=1&playlist=MVMNk0HiTMg',
            videoThumbnail:
              'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Pies al ancho de hombros con ligera rotación externa de 15 a 30 grados.',
              'Presión intraabdominal (maniobra de Valsalva) antes del descenso.',
              'Profundidad paralela o sub-paralela según movilidad de tobillo.',
            ],
            muscleGroup: 'Cuádriceps, glúteo mayor, aductores, erectores espinales',
            commonMistakes:
              'Valgo de rodilla (colapso hacia adentro) o levantar los talones.',
          },
          {
            id: 'w1-d2-e2',
            name: 'Peso Muerto Rumano con Mancuernas',
            category: 'Fuerza',
            setsReps: '4 series x 8–10 repeticiones',
            rir: 'RIR 3',
            rest: '90 seg',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/jEy_czb3RKA?autoplay=1&mute=1&loop=1&playlist=jEy_czb3RKA',
            videoThumbnail:
              'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Empujar la pelvis hacia atrás como si quisieras tocar la pared con los glúteos.',
              'Mancuernas pegadas a los muslos durante todo el recorrido.',
              'Detener el descenso cuando la cadera no pueda retroceder más.',
            ],
            muscleGroup: 'Isquiosurales, glúteos, erectores de la columna',
            commonMistakes:
              'Flexionar la columna lumbar en lugar de articular la cadera.',
          },
        ],
      },
    ],
  },
  {
    weekNumber: 2,
    title: 'Semana 2: Progresión de Volumen & Consolidación Técnica',
    phaseName: 'Fase de Sobrecarga Inicial',
    rirTarget: 'RIR 2 (2 repeticiones en reserva)',
    volumeTarget: 'Incremento del 10% en tonelaje total',
    description:
      'Consolidación de las sensaciones de la primera semana, aumentando una serie efectiva y reduciendo el margen al fallo.',
    coachAdvice:
      'Mantén la misma técnica estricta aunque la fatiga acumulada sea mayor. Registra los pesos exactos utilizados en tu cuaderno de atleta.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Día 1: Empuje & Pliometría Reactiva',
        focus: 'Combinación de empuje pesado y transferencia reactiva al salto',
        estimatedDuration: '65 min',
        exercises: [
          {
            id: 'w2-d1-e1',
            name: 'Press de Banca Plano con Parada',
            category: 'Fuerza',
            setsReps: '4 series x 6 repeticiones',
            rir: 'RIR 2',
            rest: '120 seg',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/rT7DgCr-3pg?autoplay=1&mute=1&loop=1&playlist=rT7DgCr-3pg',
            videoThumbnail:
              'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Pausa de 1.5 segundos en el pecho.',
              'Aceleración máxima concéntrica manteniendo contacto de escápulas.',
            ],
            muscleGroup: 'Pectoral, tríceps, deltoides anterior',
            commonMistakes: 'Pérdida de arco dorsal o rebote en esternón.',
          },
          {
            id: 'w2-d1-e2',
            name: 'Saltos Reactivos al Cajón (Box Jumps)',
            category: 'Potencia',
            setsReps: '4 series x 5 repeticiones',
            rir: 'Máxima explosividad',
            rest: '90 seg',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/52r_Ul5k03g?autoplay=1&mute=1&loop=1&playlist=52r_Ul5k03g',
            videoThumbnail:
              'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Aterrizaje suave y silencioso amortiguando con cadera y rodillas.',
              'Extensión completa de cadera en la parte superior del cajón.',
              'Bajar dando un paso controlado, no rebotar de espaldas.',
            ],
            muscleGroup: 'Extensores de cadera, cuádriceps, gemelos, core',
            commonMistakes:
              'Aterrizar con impacto seco o altura del cajón desproporcionada.',
          },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Día 2: Pierna & Potencia de Aceleración',
        focus: 'Fuerza unilateral y arranques explosivos en pista',
        estimatedDuration: '65 min',
        exercises: [
          {
            id: 'w2-d2-e1',
            name: 'Sentadilla Búlgara con Mancuernas',
            category: 'Fuerza',
            setsReps: '3 series x 8 reps por pierna',
            rir: 'RIR 2',
            rest: '90 seg por pierna',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/2C-uNgKwPLE?autoplay=1&mute=1&loop=1&playlist=2C-uNgKwPLE',
            videoThumbnail:
              'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Pie delantero firme sin levantar el talón.',
              'Ligera inclinación del torso hacia adelante para enfatizar glúteo medio.',
            ],
            muscleGroup: 'Glúteo mayor y medio, cuádriceps, aductores',
            commonMistakes: 'Apoyar demasiado peso en la pierna trasera.',
          },
          {
            id: 'w2-d2-e2',
            name: 'Aceleraciones de 20 Metros',
            category: 'Potencia',
            setsReps: '4 repeticiones a máxima velocidad',
            rir: 'Esfuerzo 100%',
            rest: '120 seg recuperación total',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/gLlsgQc1uO8?autoplay=1&mute=1&loop=1&playlist=gLlsgQc1uO8',
            videoThumbnail:
              'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Ángulo de salida inclinado a 45 grados en los primeros 5 metros.',
              'Brazos enérgicos y contacto en el metatarso con el suelo.',
            ],
            muscleGroup: 'Cadena posterior completa, flexores de cadera, tobillo reactivo',
            commonMistakes: 'Erguirse de golpe en el primer paso.',
          },
        ],
      },
    ],
  },
  {
    weekNumber: 3,
    title: 'Semana 3: Sobrecarga Progresiva & Máxima Densidad',
    phaseName: 'Fase de Sobrecarga Máxima',
    rirTarget: 'RIR 1–2 (Esfuerzo muy alto)',
    volumeTarget: 'Pico de volumen y densidad metabólica',
    description:
      'La semana más demandante del ciclo. Se incrementan las cargas o las repeticiones por serie manteniendo tiempos de descanso cronometrados.',
    coachAdvice:
      'Duerme mínimo 8 horas y asegura tu consumo de proteína y carbohidratos complejos. Aquí es donde se forja el estímulo real de adaptación.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Día 1: Fuerza Pura & Transferencia de Potencia',
        focus: 'Sentadilla pesada y lanzamientos balísticos',
        estimatedDuration: '70 min',
        exercises: [
          {
            id: 'w3-d1-e1',
            name: 'Sentadilla Trasera Pesada',
            category: 'Fuerza',
            setsReps: '5 series x 5 repeticiones',
            rir: 'RIR 1',
            rest: '150 seg',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/MVMNk0HiTMg?autoplay=1&mute=1&loop=1&playlist=MVMNk0HiTMg',
            videoThumbnail:
              'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Máximo reclutamiento de core y respiración diafragmática profunda.',
              'Salida agresiva desde el fondo con empuje coordinado de cadera.',
            ],
            muscleGroup: 'Cuádriceps, glúteos, erectores espinales, core',
            commonMistakes: 'Perder tensión en el punto de estancamiento (sticking point).',
          },
          {
            id: 'w3-d1-e2',
            name: 'Lanzamientos de Balón Medicinal al Suelo (Slams)',
            category: 'Potencia',
            setsReps: '4 series x 8 repeticiones',
            rir: 'Máxima potencia',
            rest: '60 seg',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/1Jc64fQ2x7o?autoplay=1&mute=1&loop=1&playlist=1Jc64fQ2x7o',
            videoThumbnail:
              'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Elevación completa por encima de la cabeza extendiendo tobillos, rodillas y cadera.',
              'Impacto violento hacia el suelo contrayendo activamente el abdomen.',
            ],
            muscleGroup: 'Dorsal ancho, recto abdominal, hombros, tríceps',
            commonMistakes: 'Doblar la espalda al recoger el balón del suelo.',
          },
        ],
      },
    ],
  },
  {
    weekNumber: 4,
    title: 'Semana 4: Pico de Intensidad & Test Submáximo / Descarga',
    phaseName: 'Fase de Consolidación o Descarga Activa',
    rirTarget: 'RIR 0–1 en test o RIR 4 si es descarga',
    volumeTarget: 'Volumen reducido al 50% con intensidad preservada',
    description:
      'Evaluación de las adaptaciones de fuerza obtenidas a lo largo de las 4 semanas o descarga estratégica para supercompensación muscular.',
    coachAdvice:
      'Si sientes fatiga articular acumulada, aplica descarga activa (mismo peso pero la mitad de series). Si te sientes al 100%, realiza los tests submáximos programados.',
    days: [
      {
        dayNumber: 1,
        dayName: 'Día 1: Evaluación Técnica de Levantamientos Principales',
        focus: 'Test submáximo controlado y registro de métricas',
        estimatedDuration: '60 min',
        exercises: [
          {
            id: 'w4-d1-e1',
            name: 'Test de Sentadilla Submáxima (3RM Estimado)',
            category: 'Fuerza',
            setsReps: '3 series de aproximación + 1 serie x 3 reps al RIR 1',
            rir: 'RIR 1',
            rest: '180 seg',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/MVMNk0HiTMg?autoplay=1&mute=1&loop=1&playlist=MVMNk0HiTMg',
            videoThumbnail:
              'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Grabación de la serie en video lateral para análisis biomecánico con Giovanni Mérida.',
              'Velocidad de barra constante sin comprometer la profundidad legal.',
            ],
            muscleGroup: 'Cadena cinética inferior completa',
            commonMistakes: 'Exceder el peso asignado comprometiendo la columna.',
          },
          {
            id: 'w4-d1-e2',
            name: 'Remo Ergómetro / Intervalo Aeróbico-Anaeróbico',
            category: 'Metabólico',
            setsReps: '5 intervalos de 500 metros con 90 seg de descanso',
            rir: 'Pace constante a 1:45/500m',
            rest: '90 seg',
            videoUrl:
              'https://www.youtube-nocookie.com/embed/zQ82RYIFLN8?autoplay=1&mute=1&loop=1&playlist=zQ82RYIFLN8',
            videoThumbnail:
              'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
            technicalTips: [
              'Secuencia biomecánica estricta: Piernas -> Cadera -> Brazos (y viceversa al regresar).',
              'Respiración rítmica controlada en cada ciclo de palada.',
            ],
            muscleGroup: 'Capacidad cardiovascular y muscular sistémica',
            commonMistakes: 'Jalar con los brazos antes de terminar el empuje de piernas.',
          },
        ],
      },
    ],
  },
];

export const DEFAULT_ATHLETES: AthleteRecord[] = [
  {
    id: 'ath-1',
    membershipId: '#TF-842918',
    fullName: 'Carlos Mendoza',
    email: 'carlos.mendoza@titanforge.com',
    phone: '+52 55 4192 8831',
    planName: 'Performance',
    goal: 'Hipertrofia miofibrilar y optimización de fuerza submáxima',
    status: 'Activo',
    enrollmentDate: '2026-08-10',
    paymentDayOfMonth: 10,
    nextPaymentDate: '10 de Diciembre de 2026',
    assignedCoach: 'Giovanni Mérida',
    notes: 'Excelente movilidad de cadera. Cuidar retracción escapular en press inclinado.',
  },
  {
    id: 'ath-2',
    membershipId: '#TF-519034',
    fullName: 'Sofía Valenzuela',
    email: 'sofia.valenzuela@gmail.com',
    phone: '+52 55 7823 1904',
    planName: 'Elite',
    goal: 'Fuerza máxima en sentadilla y primera dominada estricta con lastre',
    status: 'Activo',
    enrollmentDate: '2026-06-05',
    paymentDayOfMonth: 5,
    nextPaymentDate: '05 de Diciembre de 2026',
    assignedCoach: 'Giovanni Mérida',
    notes: 'Atleta competitiva. Responde muy bien a periodización ondulante.',
  },
  {
    id: 'ath-3',
    membershipId: '#TF-304821',
    fullName: 'Mateo Rivas',
    email: 'mateo.rivas@devmail.com',
    phone: '+52 33 9182 4410',
    planName: 'Performance',
    goal: 'Recomposición corporal y resistencia anaeróbica',
    status: 'Por vencer',
    enrollmentDate: '2026-09-18',
    paymentDayOfMonth: 18,
    nextPaymentDate: '18 de Noviembre de 2026',
    assignedCoach: 'Giovanni Mérida',
    notes: 'Entrena temprano (07:00 AM). Priorizar calentamiento torácico.',
  },
  {
    id: 'ath-4',
    membershipId: '#TF-771290',
    fullName: 'Valeria Castellanos',
    email: 'valeria.castellanos@outlook.com',
    phone: '+52 81 6502 3371',
    planName: 'Fundation',
    goal: 'Cimientos de fuerza, postura y estabilidad lumbar',
    status: 'Activo',
    enrollmentDate: '2026-10-22',
    paymentDayOfMonth: 22,
    nextPaymentDate: '22 de Noviembre de 2026',
    assignedCoach: 'Giovanni Mérida',
    notes: 'Sin lesiones previas. En fase de aprendizaje de bisagra de cadera.',
  },
  {
    id: 'ath-5',
    membershipId: '#TF-618402',
    fullName: 'Diego Santamaría',
    email: 'diego.santamaria@gmail.com',
    phone: '+52 55 3901 7745',
    planName: 'Elite',
    goal: 'Potencia explosiva, sprint y salto vertical',
    status: 'Activo',
    enrollmentDate: '2026-07-14',
    paymentDayOfMonth: 14,
    nextPaymentDate: '14 de Diciembre de 2026',
    assignedCoach: 'Giovanni Mérida',
    notes: 'Enfocado en pliometría reactiva y velocidad de barra (VBT).',
  },
];

function getRelativeIsoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DEFAULT_SESSIONS: ScheduledSession[] = [
  {
    id: 'sess-1',
    date: getRelativeIsoDate(0),
    timeSlot: '08:30 - 09:30',
    athleteName: 'Carlos Mendoza',
    athleteEmail: 'carlos.mendoza@titanforge.com',
    athletePhone: '+52 55 4192 8831',
    planTitle: 'Performance · Hipertrofia & Rendimiento',
    trainingType: 'presencial',
    goal: 'Evaluación técnica de Sentadilla Trasera y Press de Banca',
    status: 'Confirmada',
    source: 'Google Calendar',
    notes: 'Revisar profundidad sub-paralela.',
  },
  {
    id: 'sess-2',
    date: getRelativeIsoDate(0),
    timeSlot: '17:30 - 18:30',
    athleteName: 'Sofía Valenzuela',
    athleteEmail: 'sofia.valenzuela@gmail.com',
    athletePhone: '+52 55 7823 1904',
    planTitle: 'Elite · Rendimiento & Fuerza Máxima',
    trainingType: 'presencial',
    goal: 'Test submáximo 3RM y trabajo accesorio de cadena posterior',
    status: 'Confirmada',
    source: 'Sistema Web',
  },
  {
    id: 'sess-3',
    date: getRelativeIsoDate(1),
    timeSlot: '07:00 - 08:00',
    athleteName: 'Mateo Rivas',
    athleteEmail: 'mateo.rivas@devmail.com',
    athletePhone: '+52 33 9182 4410',
    planTitle: 'Performance · Hipertrofia & Rendimiento',
    trainingType: 'presencial',
    goal: 'Empuje & Pliometría Reactiva (Semana 2)',
    status: 'Confirmada',
    source: 'Google Calendar',
  },
  {
    id: 'sess-4',
    date: getRelativeIsoDate(2),
    timeSlot: '10:00 - 11:00',
    athleteName: 'Valeria Castellanos',
    athleteEmail: 'valeria.castellanos@outlook.com',
    athletePhone: '+52 81 6502 3371',
    planTitle: 'Fundation · Cimientos de Fuerza',
    trainingType: 'presencial',
    goal: 'Corrección postural y patrón de Peso Muerto Rumano',
    status: 'Pendiente',
    source: 'Sistema Web',
  },
  {
    id: 'sess-5',
    date: getRelativeIsoDate(4),
    timeSlot: '19:00 - 20:00',
    athleteName: 'Diego Santamaría',
    athleteEmail: 'diego.santamaria@gmail.com',
    athletePhone: '+52 55 3901 7745',
    planTitle: 'Elite · Rendimiento & Fuerza Máxima',
    trainingType: 'presencial',
    goal: 'Aceleraciones de 20m y saltos reactivos al cajón',
    status: 'Confirmada',
    source: 'Google Calendar',
  },
  {
    id: 'sess-6',
    date: getRelativeIsoDate(-2),
    timeSlot: '11:30 - 12:30',
    athleteName: 'Carlos Mendoza',
    athleteEmail: 'carlos.mendoza@titanforge.com',
    athletePhone: '+52 55 4192 8831',
    planTitle: 'Performance · Hipertrofia & Rendimiento',
    trainingType: 'presencial',
    goal: 'Calibración de cargas iniciales RIR 3',
    status: 'Completada',
    source: 'Google Calendar',
  },
];

export function loadWeeksData(): WeekPlan[] {
  if (typeof window === 'undefined') return DEFAULT_WEEKS_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.WEEKS);
    if (!raw) return DEFAULT_WEEKS_DATA;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length === 4 ? parsed : DEFAULT_WEEKS_DATA;
  } catch {
    return DEFAULT_WEEKS_DATA;
  }
}

export function saveWeeksData(weeks: WeekPlan[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(weeks));
  } catch (e) {
    console.warn('Could not persist weeks to localStorage:', e);
  }
}

function cloneWeeksForLevel(
  baseWeeks: WeekPlan[],
  level: ProgramLevel
): WeekPlan[] {
  const prefix = level.toLowerCase().slice(0, 3);
  return baseWeeks.map((w) => {
    let phaseName = w.phaseName;
    let rirTarget = w.rirTarget;
    let volumeTarget = w.volumeTarget;
    let description = w.description;
    let coachAdvice = w.coachAdvice;

    if (level === 'Fundation') {
      rirTarget = 'RIR 3–4 (Control Técnico)';
      volumeTarget = '10–12 series por grupo';
      phaseName = `Fundation · ${w.phaseName}`;
      description = `[Nivel Fundation] ${w.description} Priorizando rango completo de movimiento, estabilidad del core y aprendizaje técnico seguro.`;
      coachAdvice = `En Fundation priorizamos técnica impecable sobre peso en barra. ${w.coachAdvice}`;
    } else if (level === 'Elite') {
      rirTarget = 'RIR 0–1 (Máximo Estímulo)';
      volumeTarget = '18–22 series por grupo';
      phaseName = `Elite · ${w.phaseName}`;
      description = `[Nivel Elite] ${w.description} Con bloques de fuerza máxima, velocidades explosivas e intensidades avanzadas.`;
      coachAdvice = `En Elite exigimos máxima precisión en tempos y descansos cronometrados. ${w.coachAdvice}`;
    }

    return {
      ...w,
      phaseName,
      rirTarget,
      volumeTarget,
      description,
      coachAdvice,
      days: w.days.map((d) => ({
        ...d,
        exercises: d.exercises.map((ex) => {
          let setsReps = ex.setsReps;
          let rir = ex.rir;
          if (level === 'Fundation') {
            setsReps = ex.setsReps.replace(/^4\s+series/i, '3 series').replace(/^5\s+series/i, '3 series');
            rir = 'RIR 3';
          } else if (level === 'Elite') {
            setsReps = ex.setsReps.replace(/^3\s+series/i, '4 series').replace(/^4\s+series/i, '5 series');
            rir = 'RIR 0–1';
          }
          return {
            ...ex,
            id: `${prefix}-${ex.id}`,
            setsReps,
            rir,
          };
        }),
      })),
    };
  });
}

export function createDefaultWeeksByLevel(): WeeksByLevel {
  return {
    Fundation: cloneWeeksForLevel(DEFAULT_WEEKS_DATA, 'Fundation'),
    Performance: cloneWeeksForLevel(DEFAULT_WEEKS_DATA, 'Performance'),
    Elite: cloneWeeksForLevel(DEFAULT_WEEKS_DATA, 'Elite'),
  };
}

export function loadWeeksByLevel(): WeeksByLevel {
  const defaults = createDefaultWeeksByLevel();
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.WEEKS_BY_LEVEL);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<WeeksByLevel>;
      return {
        Fundation:
          Array.isArray(parsed.Fundation) && parsed.Fundation.length === 4
            ? parsed.Fundation
            : defaults.Fundation,
        Performance:
          Array.isArray(parsed.Performance) && parsed.Performance.length === 4
            ? parsed.Performance
            : defaults.Performance,
        Elite:
          Array.isArray(parsed.Elite) && parsed.Elite.length === 4
            ? parsed.Elite
            : defaults.Elite,
      };
    }

    // Migrate legacy tf_admin_weeks_v1 into Performance if present
    const legacyRaw = window.localStorage.getItem(STORAGE_KEYS.WEEKS);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed) && legacyParsed.length === 4) {
        return {
          ...defaults,
          Performance: legacyParsed,
        };
      }
    }
    return defaults;
  } catch {
    return defaults;
  }
}

export function saveWeeksByLevel(data: WeeksByLevel): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.WEEKS_BY_LEVEL, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not persist weeksByLevel to localStorage:', e);
  }
}

export function loadAthletes(): AthleteRecord[] {
  if (typeof window === 'undefined') return DEFAULT_ATHLETES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.ATHLETES);
    if (!raw) return DEFAULT_ATHLETES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ATHLETES;
  } catch {
    return DEFAULT_ATHLETES;
  }
}

export function saveAthletes(athletes: AthleteRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.ATHLETES, JSON.stringify(athletes));
  } catch (e) {
    console.warn('Could not persist athletes to localStorage:', e);
  }
}

export function loadSessions(): ScheduledSession[] {
  if (typeof window === 'undefined') return DEFAULT_SESSIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return DEFAULT_SESSIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SESSIONS;
  } catch {
    return DEFAULT_SESSIONS;
  }
}

export function saveSessions(sessions: ScheduledSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Could not persist sessions to localStorage:', e);
  }
}

export function loadCalendarEmail(): string {
  if (typeof window === 'undefined') return DEFAULT_CALENDAR_EMAIL;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.CALENDAR_EMAIL);
    return raw && raw.trim() ? raw.trim() : DEFAULT_CALENDAR_EMAIL;
  } catch {
    return DEFAULT_CALENDAR_EMAIL;
  }
}

export function saveCalendarEmail(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    const clean = email.trim();
    if (clean) {
      window.localStorage.setItem(STORAGE_KEYS.CALENDAR_EMAIL, clean);
    }
  } catch (e) {
    console.warn('Could not persist calendar email to localStorage:', e);
  }
}
