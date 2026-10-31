import React, { useState } from 'react';
import {
  X,
  Calculator,
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BMICalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlanAndBook?: (level: 'principiante' | 'intermedio' | 'avanzado') => void;
}

export interface BMIResult {
  bmi: number;
  category: 'Bajo peso' | 'Peso saludable' | 'Sobrepeso' | 'Obesidad';
  categoryColor: string;
  recommendedLevel: 'principiante' | 'intermedio' | 'avanzado';
  levelTitle: string;
  recommendedRoutine: string;
  caloriesEstimate: number;
  targetHeartRate: string;
  weeklySessions: number;
  tips: string[];
}

export const BMICalculatorModal: React.FC<BMICalculatorModalProps> = ({
  isOpen,
  onClose,
  onSelectPlanAndBook,
}) => {
  const [gender, setGender] = useState<'hombre' | 'mujer'>('hombre');
  const [age, setAge] = useState<number | ''>(28);
  const [weightKg, setWeightKg] = useState<number | ''>(75);
  const [heightCm, setHeightCm] = useState<number | ''>(178);
  const [activityLevel, setActivityLevel] = useState<'sedentario' | 'ligero' | 'moderado' | 'intenso'>('moderado');
  const [goal, setGoal] = useState<'perder_grasa' | 'ganar_musculo' | 'fuerza_resistencia'>('ganar_musculo');

  const [result, setResult] = useState<BMIResult | null>(null);

  if (!isOpen) return null;

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg || !heightCm || !age) return;

    const heightM = Number(heightCm) / 100;
    const bmiVal = Number((Number(weightKg) / (heightM * heightM)).toFixed(1));

    let category: BMIResult['category'] = 'Peso saludable';
    let categoryColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

    if (bmiVal < 18.5) {
      category = 'Bajo peso';
      categoryColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    } else if (bmiVal < 25) {
      category = 'Peso saludable';
      categoryColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    } else if (bmiVal < 30) {
      category = 'Sobrepeso';
      categoryColor = 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    } else {
      category = 'Obesidad';
      categoryColor = 'text-red-400 bg-red-500/10 border-red-500/30';
    }

    // Determine level according to user's activity and history
    let recommendedLevel: 'principiante' | 'intermedio' | 'avanzado' = 'intermedio';
    let levelTitle = 'Intermedio';
    let weeklySessions = 4;
    let recommendedRoutine = 'Rutina Torso / Pierna con progresión de cargas lineales (4 días)';

    if (activityLevel === 'sedentario' || activityLevel === 'ligero') {
      recommendedLevel = 'principiante';
      levelTitle = 'Principiante';
      weeklySessions = 3;
      recommendedRoutine = 'Rutina Full-Body 3 días x semana con enfoque en biomecánica y técnica';
    } else if (activityLevel === 'intenso') {
      recommendedLevel = 'avanzado';
      levelTitle = 'Avanzado';
      weeklySessions = 5;
      recommendedRoutine = 'Periodización Ondulante Push-Pull-Legs con alta intensidad y RIR estricto';
    }

    // Basal Metabolic Rate (Harris-Benedict formula approx)
    const bmr =
      gender === 'hombre'
        ? 88.36 + 13.4 * Number(weightKg) + 4.8 * Number(heightCm) - 5.7 * Number(age)
        : 447.6 + 9.2 * Number(weightKg) + 3.1 * Number(heightCm) - 4.3 * Number(age);

    const multipliers = {
      sedentario: 1.2,
      ligero: 1.375,
      moderado: 1.55,
      intenso: 1.725,
    };
    const tdee = Math.round(bmr * multipliers[activityLevel]);

    let targetCalories = tdee;
    if (goal === 'perder_grasa') {
      targetCalories = Math.round(tdee - 450);
    } else if (goal === 'ganar_musculo') {
      targetCalories = Math.round(tdee + 300);
    }

    const tips = [
      goal === 'ganar_musculo'
        ? 'Consume 1.8g - 2.2g de proteína por kg de peso corporal.'
        : 'Prioriza un déficit calórico moderado garantizando al menos 2g/kg de proteína.',
      'Mantén una hidratación de al menos 35-40 ml por kg de peso al día.',
      `Objetivo de frecuencia: ${weeklySessions} sesiones semanales con descanso estratégico.`,
    ];

    setResult({
      bmi: bmiVal,
      category,
      categoryColor,
      recommendedLevel,
      levelTitle,
      recommendedRoutine,
      caloriesEstimate: targetCalories,
      targetHeartRate: `${Math.round((220 - Number(age)) * 0.65)} - ${Math.round((220 - Number(age)) * 0.82)} bpm`,
      weeklySessions,
      tips,
    });

    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#E50914', '#ffffff', '#000000', '#fbbf24'],
    });
  };

  const handleReset = () => {
    setResult(null);
  };

  const handleBookWithLevel = () => {
    if (result && onSelectPlanAndBook) {
      onSelectPlanAndBook(result.recommendedLevel);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in font-montserrat">
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl my-8 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-zinc-400 hover:text-white bg-[#222222] hover:bg-[#333333] transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-lg bg-[#E50914] text-white flex items-center justify-center shrink-0 shadow-md">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#E50914] uppercase tracking-widest">
              PASO 1 · TITAN FORGE
            </div>
            <h3 className="text-2xl sm:text-3xl font-montserrat font-black text-white tracking-tight uppercase">
              CALCULADORA IMC & NIVEL
            </h3>
          </div>
        </div>

        {!result ? (
          /* Calculator Form */
          <form onSubmit={calculateBMI} className="space-y-5">
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              Ingresa tus datos y cuéntanos sobre tus objetivos. En segundos, obtendrás tu nivel de entrenamiento (Principiante, Intermedio o Avanzado) y un plan diseñado para ti.
            </p>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Sexo Biológico
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('hombre')}
                  className={`py-3 px-4 rounded-md border text-xs sm:text-sm font-bold uppercase transition-all ${
                    gender === 'hombre'
                      ? 'bg-[#E50914] text-white border-[#E50914] shadow-md'
                      : 'bg-[#222222] border-[#333333] text-zinc-400 hover:text-white'
                  }`}
                >
                  Hombre
                </button>
                <button
                  type="button"
                  onClick={() => setGender('mujer')}
                  className={`py-3 px-4 rounded-md border text-xs sm:text-sm font-bold uppercase transition-all ${
                    gender === 'mujer'
                      ? 'bg-[#E50914] text-white border-[#E50914] shadow-md'
                      : 'bg-[#222222] border-[#333333] text-zinc-400 hover:text-white'
                  }`}
                >
                  Mujer
                </button>
              </div>
            </div>

            {/* Metrics: Age, Weight, Height */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Edad (años) *
                </label>
                <input
                  type="number"
                  min="14"
                  max="90"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[#222222] border border-[#333333] focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-md px-4 py-3 text-sm text-white outline-none font-medium"
                  placeholder="28"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Peso (kg) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="35"
                  max="220"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[#222222] border border-[#333333] focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-md px-4 py-3 text-sm text-white outline-none font-medium"
                  placeholder="75"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Estatura (cm) *
                </label>
                <input
                  type="number"
                  min="120"
                  max="230"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-[#222222] border border-[#333333] focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-md px-4 py-3 text-sm text-white outline-none font-medium"
                  placeholder="178"
                />
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Nivel de Actividad Física
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'sedentario', label: 'Sedentario', sub: 'Poco o nada' },
                  { id: 'ligero', label: 'Ligero', sub: '1-2 días/sem' },
                  { id: 'moderado', label: 'Moderado', sub: '3-4 días/sem' },
                  { id: 'intenso', label: 'Intenso', sub: '5+ días/sem' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityLevel(act.id as any)}
                    className={`p-3 rounded-md border text-left transition-all ${
                      activityLevel === act.id
                        ? 'bg-[#E50914]/20 border-[#E50914] text-white'
                        : 'bg-[#222222] border-[#333333] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold uppercase">{act.label}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{act.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Objective */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Objetivo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'perder_grasa', label: 'Quemar Grasa & Definir' },
                  { id: 'ganar_musculo', label: 'Hipertrofia Muscular' },
                  { id: 'fuerza_resistencia', label: 'Fuerza & Condición' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id as any)}
                    className={`py-3 px-3 rounded-md border text-xs font-bold uppercase transition-all text-center ${
                      goal === g.id
                        ? 'bg-[#E50914] text-white border-[#E50914] shadow-md'
                        : 'bg-[#222222] border-[#333333] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#c90812] text-white font-montserrat font-black uppercase tracking-wider py-4 px-6 rounded-md transition-all shadow-xl active:scale-98 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>Calcular mi entrenamiento</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          /* Results View */
          <div className="space-y-6">
            <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl p-6 sm:p-7 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2e2e2e] pb-5 mb-5">
                <div>
                  <div className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
                    Tu Índice de Masa Corporal
                  </div>
                  <div className="text-4xl sm:text-5xl font-montserrat font-black text-white mt-1">
                    {result.bmi}{' '}
                    <span className="text-xs font-normal text-zinc-400">kg/m²</span>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-md border text-xs font-bold uppercase tracking-wider self-start sm:self-center ${result.categoryColor}`}>
                  {result.category}
                </div>
              </div>

              {/* Step 2 recommendation match from PDF */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-[#E50914] uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>PASO 2 · PROGRAMA ASIGNADO</span>
                </div>

                <div className="bg-[#111111] border border-[#E50914]/50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="text-base font-montserrat font-black text-white uppercase tracking-wider">
                      PLAN {result.levelTitle}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      {result.recommendedRoutine}
                    </div>
                  </div>
                  <span className="text-xs font-black bg-[#E50914] text-white px-3 py-1.5 rounded-sm uppercase tracking-wider">
                    RECOMENDADO
                  </span>
                </div>

                {/* Key Metrics grid */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#111111] p-3 rounded-md border border-[#2a2a2a]">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Calorías meta</div>
                    <div className="text-sm font-bold text-white mt-0.5">~{result.caloriesEstimate} kcal</div>
                  </div>
                  <div className="bg-[#111111] p-3 rounded-md border border-[#2a2a2a]">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Frecuencia</div>
                    <div className="text-sm font-bold text-[#E50914] mt-0.5">{result.weeklySessions} días/sem</div>
                  </div>
                  <div className="bg-[#111111] p-3 rounded-md border border-[#2a2a2a]">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">FC Objetivo</div>
                    <div className="text-xs font-bold text-white mt-1">{result.targetHeartRate}</div>
                  </div>
                </div>

                {/* Tips */}
                <div className="pt-2 space-y-2">
                  {result.tips.map((t, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-4 rounded-md border border-[#333333] text-zinc-400 hover:text-white text-xs font-bold uppercase flex items-center justify-center gap-2 hover:bg-[#222222] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recalcular</span>
              </button>

              <button
                type="button"
                onClick={handleBookWithLevel}
                className="flex-1 py-4 px-6 rounded-md bg-[#E50914] hover:bg-[#c90812] text-white text-xs sm:text-sm font-montserrat font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar mi plan {result.levelTitle}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
