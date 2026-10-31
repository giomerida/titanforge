import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Información sobre planes mensuales',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Simulate sending message or preparing inquiry
    setTimeout(() => {
      setIsSending(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <section id="contacto" className="py-20 md:py-28 relative border-t border-zinc-900 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details & Info */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="text-xs sm:text-sm font-black tracking-widest uppercase text-red-600 mb-2">
                Ponte en Contacto
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
                ¿Tienes dudas o buscas asesoría directa?
              </h2>
              <p className="text-zinc-400 mt-4 text-base leading-relaxed">
                El equipo de Titan Forge te acompaña en cada etapa. Si requieres detalles adicionales sobre nuestros mesociclos, agenda o evaluación física, contáctanos hoy mismo.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Email Directo</div>
                  <a href="mailto:contact@titanforge.com" className="text-sm font-medium text-white hover:text-amber-400 transition-colors">
                    contact@titanforge.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">WhatsApp / Teléfono</div>
                  <span className="text-sm font-medium text-white">+52 (55) 8492-3100</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Ubicación Presencial</div>
                  <span className="text-sm font-medium text-white">Centro de Entrenamiento Elite, CDMX / Sesiones Online Internacional</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Horarios de Atención</div>
                  <span className="text-sm font-medium text-zinc-300">Lunes a Sábado: 06:30 - 21:00 hrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white font-display">¡Mensaje Enviado con Éxito!</h3>
                <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                  Gracias por comunicarte, <strong>{formData.name}</strong>. Giovanni te responderá a tu correo (<em>{formData.email}</em>) a la brevedad posible.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        subject: 'Información sobre planes mensuales',
                        message: '',
                      });
                    }}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-b border-zinc-800 pb-4 mb-2">
                  <h3 className="text-lg font-bold text-white font-display">Envía un Mensaje Directo</h3>
                  <p className="text-xs text-zinc-400">Te responderemos en menos de 2 horas hábiles.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Rodrigo Álvarez"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="+52 (55) 1234-5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">
                      Asunto de Consulta
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                    >
                      <option value="Información sobre planes mensuales">Planes de Entrenamiento Mensual</option>
                      <option value="Consulta sobre rehabilitación">Rehabilitación & Molestias Articulares</option>
                      <option value="Preparación Física Atletas">Preparación Física de Atletas</option>
                      <option value="Duda sobre el sistema de reservas">Duda sobre la agenda / reservas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    Tu Mensaje o Dudas *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Cuéntanos brevemente sobre tu condición actual o qué dudas tienes..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-amber-400 text-white hover:text-zinc-950 font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Enviando Mensaje...' : 'Enviar Consulta'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
