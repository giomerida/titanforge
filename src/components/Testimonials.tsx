import React from 'react';
import { Star, Quote, TrendingUp } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/landingData';

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonios" className="py-20 md:py-28 bg-zinc-950/80 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-amber-400 mb-2">
            Historias Reales
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
            Casos de Éxito de Atletas y Alumnos
          </h2>
          <p className="text-zinc-400 mt-4 text-base leading-relaxed">
            Personas con horarios exigentes, trabajo de oficina o metas competitivas que lograron transformar su salud y rendimiento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS_DATA.map((t) => (
            <div
              key={t.id}
              className="p-7 sm:p-8 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-all duration-300"
            >
              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Main achievement highlight */}
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{t.achievement}</span>
                </div>

                {/* Quote */}
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Author info & Metric Pill replacement (clean unboxed data) */}
              <div className="pt-5 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border border-amber-400/40"
                  />
                  <div>
                    <div className="text-white font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-zinc-400">{t.role}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-zinc-400">{t.stats.label}</div>
                  <div className="text-xs font-bold text-emerald-400">{t.stats.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
