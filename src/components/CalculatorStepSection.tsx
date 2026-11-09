import React, { useState } from 'react';
import { Calculator, ArrowRight, RotateCcw, CheckCircle2, Flame, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import fondoPaso1 from '../../img/fondo_paso1.png';

interface CalculatorStepSectionProps {
  onSelectPlanAndBook?: (level: 'principiante' | 'intermedio' | 'avanzado') => void;
  onOpenCalculator?: () => void;
}

export interface Step1BMIResult {
  bmi: number;
  category: 'Bajo peso' | 'Peso saludable' | 'Sobrepeso' | 'Obesidad';
  categoryColor: string;
  recommendedLevel: 'principiante' | 'intermedio' | 'avanzado';
  planName: 'FUNDATION' | 'PERFORMANCE' | 'ELITE';
  planSubtitle: string;
  caloriesEstimate: number;
  weeklySessions: number;
  recommendedRoutine: string;
}

export const CalculatorStepSection: React.FC<CalculatorStepSectionProps> = ({
  onSelectPlanAndBook,
}) => {
  const [gender, setGender] = useState<'hombre' | 'mujer'>('hombre');
  const [age, setAge] = useState<number | ''>(26);
  const [weightKg, setWeightKg] = useState<number | ''>(76);
  const [heightCm, setHeightCm] = useState<number | ''>(178);
  const [activityLevel, setActivityLevel] = useState<'sedentario' | 'ligero' | 'moderado' | 'intenso'>('moderado');
  const [goal, setGoal] = useState<'perder_grasa' | 'ganar_musculo' | 'fuerza_resistencia'>('ganar_musculo');

  const [result, setResult] = useState<Step1BMIResult | null>(null);

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg || !heightCm || !age) return;

    const heightM = Number(heightCm) / 100;
    const bmiVal = Number((Number(weightKg) / (heightM * heightM)).toFixed(1));

    let category: Step1BMIResult['category'] = 'Peso saludable';
    let categoryColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';

    if (bmiVal < 18.5) {
      category = 'Bajo peso';
      categoryColor = 'bg-amber-500/20 text-amber-300 border-amber-400/40';
    } else if (bmiVal < 25) {
      category = 'Peso saludable';
      categoryColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    } else if (bmiVal < 30) {
      category = 'Sobrepeso';
      categoryColor = 'bg-orange-500/20 text-orange-300 border-orange-400/40';
    } else {
      category = 'Obesidad';
      categoryColor = 'bg-red-950/40 text-red-200 border-red-400/40';
    }

    // Determine recommended plan according to activity level
    let recommendedLevel: 'principiante' | 'intermedio' | 'avanzado' = 'intermedio';
    let planName: 'FUNDATION' | 'PERFORMANCE' | 'ELITE' = 'PERFORMANCE';
    let planSubtitle = 'Hipertrofia & Rendimiento Progresivo';
    let weeklySessions = 4;
    let recommendedRoutine = 'Rutina Torso / Pierna con progresión lineal y RIR controlado';

    if (activityLevel === 'sedentario' || activityLevel === 'ligero') {
      recommendedLevel = 'principiante';
      planName = 'FUNDATION';
      planSubtitle = 'Cimientos de Fuerza & Adaptación Biomecánica';
      weeklySessions = 3;
      recommendedRoutine = 'Rutina Full-Body 3 días x semana con enfoque técnico estricto';
    } else if (activityLevel === 'intenso') {
      recommendedLevel = 'avanzado';
      planName = 'ELITE';
      planSubtitle = 'Fuerza Máxima & Periodización Avanzada';
      weeklySessions = 5;
      recommendedRoutine = 'Periodización Push-Pull-Legs con alta intensidad y sobrecarga guiada';
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

    let totalCal = bmr * multipliers[activityLevel];
    if (goal === 'perder_grasa') totalCal -= 400;
    else if (goal === 'ganar_musculo') totalCal += 350;
    else if (goal === 'fuerza_resistencia') totalCal += 150;

    const res: Step1BMIResult = {
      bmi: bmiVal,
      category,
      categoryColor,
      recommendedLevel,
      planName,
      planSubtitle,
      caloriesEstimate: Math.round(totalCal),
      weeklySessions,
      recommendedRoutine,
    };

    setResult(res);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#E50914', '#111111', '#fbbf24'],
      });
    } catch {
      // Ignore if confetti not supported
    }
  };

  const handleBookPlan = () => {
    if (result && onSelectPlanAndBook) {
      onSelectPlanAndBook(result.recommendedLevel);
    } else {
      // Fallback scroll to booking section
      const bookingEl = document.getElementById('reservas');
      if (bookingEl) {
        bookingEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="calculadora" className="w-full bg-[#111111] text-white py-14 sm:py-20 relative overflow-hidden">
      {/* Background athlete photo without opacity reduction */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={fondoPaso1}
          alt="Fondo Paso 1 Titan Forge"
          className="w-full h-full object-cover object-center filter contrast-110 brightness-95"
        />
        {/* Soft gradient from left to ensure text legibility while keeping the image crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: PASO 1 + USA NUESTRA CALCULADORA */}
          <div className="lg:col-span-5 space-y-4 relative z-10">
            {/* Step label in dark orange/red - 2x larger */}
            <div className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#E50914] tracking-widest uppercase">
              PASO 1
            </div>

            {/* Main Heading in Montserrat Bold/Black */}
            <h2 className="font-montserrat font-black text-3xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-[1.02]">
              USA NUESTRA <br />
              CALCULADORA.
            </h2>

            {/* Description matching PDF */}
            <p className="font-montserrat text-xs sm:text-[14px] text-[#cccccc] max-w-md leading-relaxed pt-1">
              Ingresa tus datos y cuéntanos sobre tus objetivos. En segundos, obtendrás tu nivel de entrenamiento y un plan diseñado especialmente para ti.
            </p>

            <div className="pt-4 hidden lg:flex flex-col gap-2.5 text-xs text-white/80 font-montserrat">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E50914]" />
                <span>Cálculo inmediato de IMC y gasto calórico</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E50914]" />
                <span>Asignación automática a FUNDATION, PERFORMANCE o ELITE</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E50914]" />
                <span>Acceso directo a agendamiento de sesión personalizada</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Calculator directly embedded inside the Red Block */}
          <div className="lg:col-span-7 relative flex justify-center lg:justify-end">
            <div className="w-full max-w-xl bg-[#E50914] rounded-lg shadow-2xl p-5 sm:p-7 text-white border border-red-500/40 relative min-h-[510px] sm:min-h-[530px] flex flex-col justify-between">
              {/* Header inside the red space */}
              <div className="flex items-center justify-between gap-3 mb-4 border-b border-white/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black/25 flex items-center justify-center shrink-0">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-montserrat font-black text-lg sm:text-xl text-white uppercase tracking-tight leading-none">
                      CALCULA AQUÍ
                    </h3>
                    <span className="font-montserrat text-[11px] text-white/90 font-bold tracking-wider uppercase">
                      IMC & NIVEL DE ENTRENAMIENTO
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-montserrat font-black bg-black/30 px-3 py-1 rounded-full text-white uppercase tracking-wider">
                  EN VIVO
                </span>
              </div>

              {!result ? (
                /* Form view with flex layout to match result height */
                <form onSubmit={calculateBMI} className="flex-1 flex flex-col justify-between space-y-4">
                  {/* Sex Selection */}
                  <div>
                    <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-white/90 mb-1.5">
                      Género
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender('hombre')}
                        className={`py-2 px-3 rounded-md text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          gender === 'hombre'
                            ? 'bg-white text-black shadow-md'
                            : 'bg-black/25 text-white hover:bg-black/40'
                        }`}
                      >
                        Hombre
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('mujer')}
                        className={`py-2 px-3 rounded-md text-xs font-montserrat font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          gender === 'mujer'
                            ? 'bg-white text-black shadow-md'
                            : 'bg-black/25 text-white hover:bg-black/40'
                        }`}
                      >
                        Mujer
                      </button>
                    </div>
                  </div>

                  {/* Age, Weight, Height Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-white/90 mb-1">
                        Edad
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="14"
                          max="85"
                          value={age}
                          onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="26"
                          required
                          className="w-full bg-black/25 border border-white/30 rounded-md px-3 py-2 text-white font-montserrat font-bold text-sm focus:outline-none focus:bg-black/45 focus:border-white transition-all text-center"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-white/60 pointer-events-none">
                          años
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-white/90 mb-1">
                        Peso
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="35"
                          max="220"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="76"
                          required
                          className="w-full bg-black/25 border border-white/30 rounded-md px-3 py-2 text-white font-montserrat font-bold text-sm focus:outline-none focus:bg-black/45 focus:border-white transition-all text-center"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-white/60 pointer-events-none">
                          kg
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-white/90 mb-1">
                        Altura
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="120"
                          max="230"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="178"
                          required
                          className="w-full bg-black/25 border border-white/30 rounded-md px-3 py-2 text-white font-montserrat font-bold text-sm focus:outline-none focus:bg-black/45 focus:border-white transition-all text-center"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-white/60 pointer-events-none">
                          cm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Level & Goal in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-white/90 mb-1">
                        Nivel de Actividad
                      </label>
                      <select
                        value={activityLevel}
                        onChange={(e) => setActivityLevel(e.target.value as any)}
                        className="w-full bg-black/30 border border-white/30 rounded-md px-2.5 py-2 text-white font-montserrat text-xs focus:outline-none focus:bg-black/50 focus:border-white transition-all cursor-pointer"
                      >
                        <option value="sedentario" className="bg-zinc-900 text-white">Sedentario (Poco o nada)</option>
                        <option value="ligero" className="bg-zinc-900 text-white">Ligero (1-2 días/sem)</option>
                        <option value="moderado" className="bg-zinc-900 text-white">Moderado (3-4 días/sem)</option>
                        <option value="intenso" className="bg-zinc-900 text-white">Intenso (5+ días/sem)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-montserrat font-bold uppercase tracking-wider text-white/90 mb-1">
                        Objetivo Principal
                      </label>
                      <select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value as any)}
                        className="w-full bg-black/30 border border-white/30 rounded-md px-2.5 py-2 text-white font-montserrat text-xs focus:outline-none focus:bg-black/50 focus:border-white transition-all cursor-pointer"
                      >
                        <option value="perder_grasa" className="bg-zinc-900 text-white">Perder grasa / Definición</option>
                        <option value="ganar_musculo" className="bg-zinc-900 text-white">Ganar músculo / Hipertrofia</option>
                        <option value="fuerza_resistencia" className="bg-zinc-900 text-white">Fuerza & Rendimiento</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-black hover:bg-zinc-900 text-white font-montserrat font-black text-sm uppercase py-3.5 px-6 rounded-md shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer hover:scale-[1.01] active:scale-95"
                    >
                      <span>OBTENER MI PLAN AHORA</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              ) : (
                /* Results View inside the red block with matching height */
                <div className="flex-1 flex flex-col justify-between space-y-4 animate-fadeIn">
                  {/* Top Result Banner */}
                  <div className="bg-black/35 rounded-md p-4 border border-white/20 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="font-montserrat text-xs text-white/80 uppercase tracking-widest font-bold">
                        Tu IMC:
                      </span>
                      <span className="font-montserrat font-black text-2xl text-white">
                        {result.bmi}
                      </span>
                      <span className={`text-[11px] font-montserrat font-black uppercase px-2.5 py-0.5 rounded-full border ${result.categoryColor}`}>
                        {result.category}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <div className="text-[11px] font-montserrat font-extrabold uppercase tracking-widest text-white/70">
                        PLAN RECOMENDADO PARA TI:
                      </div>
                      <div className="font-montserrat font-black text-3xl sm:text-4xl text-white tracking-wider uppercase mt-1 drop-shadow-md">
                        {result.planName}
                      </div>
                      <div className="text-xs font-montserrat font-semibold text-white/90 mt-1">
                        {result.planSubtitle}
                      </div>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-black/25 rounded-md p-3 border border-white/15 flex items-center gap-2.5">
                      <Flame className="w-6 h-6 text-amber-300 shrink-0" />
                      <div>
                        <div className="text-[10px] font-montserrat font-bold text-white/70 uppercase">
                          Calorías Objetivo
                        </div>
                        <div className="font-montserrat font-black text-base text-white">
                          ~{result.caloriesEstimate.toLocaleString()} kcal/día
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/25 rounded-md p-3 border border-white/15 flex items-center gap-2.5">
                      <Activity className="w-6 h-6 text-emerald-300 shrink-0" />
                      <div>
                        <div className="text-[10px] font-montserrat font-bold text-white/70 uppercase">
                          Frecuencia Ideal
                        </div>
                        <div className="font-montserrat font-black text-base text-white">
                          {result.weeklySessions} sesiones / sem
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] font-montserrat text-white/85 bg-black/20 p-2.5 rounded-md leading-relaxed border border-white/10">
                    💡 <span className="font-bold">Estrategia:</span> {result.recommendedRoutine}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleBookPlan}
                      className="w-full sm:flex-1 bg-white hover:bg-zinc-100 text-black font-montserrat font-black text-xs sm:text-sm uppercase py-3 px-4 rounded-md shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>AGENDAR {result.planName} ↗</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setResult(null)}
                      className="w-full sm:w-auto bg-black/30 hover:bg-black/50 text-white font-montserrat font-bold text-xs uppercase py-3 px-3.5 rounded-md border border-white/25 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Volver a calcular"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="sm:hidden">Recalcular</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
