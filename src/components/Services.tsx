import React from 'react';
import { Check, Calendar, Clock, DollarSign, Sparkles } from 'lucide-react';
import { SERVICES_DATA, ServiceItem } from '../data/landingData';

interface ServicesProps {
  onSelectService: (service: ServiceItem) => void;
  selectedServiceId: string;
}

export const Services: React.FC<ServicesProps> = ({
  onSelectService,
  selectedServiceId,
}) => {
  return (
    <section id="servicios" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-amber-400 mb-2">
              Planes & Programas
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
              Servicios Diseñados Para Tu Objetivo
            </h2>
            <p className="text-zinc-400 mt-4 text-base leading-relaxed">
              Selecciona el programa que mejor se adapta a tus metas y resérvalo directamente en la agenda online.
            </p>
          </div>
          <div className="text-xs text-zinc-400 border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 rounded-xl self-start md:self-end flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Disponibilidad inmediata en Google Calendar</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES_DATA.map((service) => {
            const isSelected = selectedServiceId === service.id;
            return (
              <div
                key={service.id}
                className={`rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden border ${
                  isSelected
                    ? 'border-amber-400 bg-zinc-900 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-400/50'
                    : service.popular
                    ? 'border-amber-500/40 bg-zinc-900/90 shadow-xl'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                {/* Image header */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                  
                  {service.popular && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-md shadow-md flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Más Solicitado
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 text-xs font-semibold uppercase tracking-wider text-amber-400">
                    {service.category}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {service.title}
                    </h3>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-display font-black text-white">
                        {service.price}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">/ sesión personalizada</span>
                    </div>

                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-3 mb-6 pt-4 border-t border-zinc-800">
                      <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                        Qué incluye esta sesión:
                      </div>
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                          <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {service.durationMinutes} min de sesión
                      </span>
                      <span>Presencial u Online</span>
                    </div>

                    <button
                      onClick={() => onSelectService(service)}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                          : 'bg-zinc-800 hover:bg-amber-500 text-white hover:text-zinc-950'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{isSelected ? 'Seleccionado para Agendar' : 'Elegir & Agendar Cita'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
