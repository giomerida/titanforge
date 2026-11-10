export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  image: string;
  levelKey: 'principiante' | 'intermedio' | 'avanzado';
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  avatar: string;
  achievement: string;
  quote: string;
  rating: number;
  stats: {
    label: string;
    value: string;
  };
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'principiante-plan',
    title: 'Fundation · Cimientos de Fuerza',
    category: 'Plan Fundation',
    durationMinutes: 60,
    price: '$35 USD',
    description: 'Objetivo: desarrollar fuerza, potencia, resistencia anaeróbica y capacidad de trabajo mediante un estímulo híbrido de fuerza y acondicionamiento metabólico.',
    features: [
      'Evaluación biomecánica inicial y movilidad articular',
      'Rutina Full-Body 3 días x semana con sobrecarga adaptativa',
      'Corrección postural y prevención activa de lesiones',
      'Acompañamiento cercano y registro de avances',
    ],
    popular: false,
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    levelKey: 'principiante',
  },
  {
    id: 'intermedio-plan',
    title: 'Performance · Hipertrofia & Rendimiento',
    category: 'Plan Performance',
    durationMinutes: 60,
    price: '$45 USD',
    description: 'Protocolo de hipertrofia y fuerza por grupos musculares (Torso/Pierna o Push-Pull-Legs) aplicando RIR controlado para romper estancamientos.',
    features: [
      'Periodización por bloques con volumen óptimo recuperable',
      'Técnica estricta en levantamientos principales',
      'Monitoreo semanal de cargas y fatiga sistémica',
      'Guía nutricional de macronutrientes para hipertrofia',
    ],
    popular: true,
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    levelKey: 'intermedio',
  },
  {
    id: 'avanzado-plan',
    title: 'Elite · Rendimiento & Fuerza Máxima',
    category: 'Plan Elite',
    durationMinutes: 60,
    price: '$55 USD',
    description: 'Periodización ondulante diaria con alta especificidad biomecánica, potencia explosiva y optimización metabólica de alto nivel competitivo.',
    features: [
      'Microciclos y mesociclos calibrados por velocidad y RPE',
      'Trabajo accesorio de eslabones débiles y potencia',
      'Estrategias avanzadas de recuperación y deloading',
      'Videoanálisis biomecánico en tiempo real',
    ],
    popular: false,
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    levelKey: 'avanzado',
  },
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    role: 'Atleta Titan Forge · 38 años',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    achievement: '-14 kg de grasa y aumento de fuerza',
    quote: 'Usé la calculadora IMC de Titan Forge, me asignó el plan Intermedio y en 4 meses transformé radicalmente mi condición física. Sincronizado a mi Google Calendar no fallo una sola sesión.',
    rating: 5,
    stats: {
      label: 'Grasa corporal',
      value: '-11% en 4 meses',
    },
  },
  {
    id: '2',
    name: 'Sofía Valenzuela',
    role: 'Miembro Titan Forge · 29 años',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    achievement: 'Primera dominada estricta y +4kg masa muscular',
    quote: 'La atención a la técnica y la disciplina de Titan Forge forjaron mi carácter. Aprender a levantar con base científica cambió mi vida por completo.',
    rating: 5,
    stats: {
      label: 'Fuerza Sentadilla',
      value: '+45 kg PR',
    },
  },
  {
    id: '3',
    name: 'Mateo Rivas',
    role: 'Desarrollador de Software · 33 años',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    achievement: 'Constancia absoluta y plan a medida',
    quote: 'El agendamiento automático y las notificaciones a mi correo hacen que mantener la disciplina sea automático.',
    rating: 5,
    stats: {
      label: 'Constancia',
      value: '98% asistencias',
    },
  },
];

export const AVAILABLE_TIME_SLOTS = [
  '07:00 - 08:00',
  '08:30 - 09:30',
  '10:00 - 11:00',
  '11:30 - 12:30',
  '16:00 - 17:00',
  '17:30 - 18:30',
  '19:00 - 20:00',
];
