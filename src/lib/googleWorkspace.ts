/**
 * Services to interact with Google Calendar and Gmail API
 */

export interface BookingDetails {
  serviceId: string;
  serviceTitle: string;
  serviceDurationMinutes: number;
  servicePrice: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientGoals: string;
  trainingType: 'presencial' | 'online';
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 - 10:00"
  trainerEmail: string;
  notes?: string;
}

/**
 * Creates an event in Google Calendar using the accessToken.
 * Supports attendees, conferenceData/description, and explicit start/end times.
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  booking: BookingDetails
) {
  const [startTimeStr, endTimeStr] = booking.timeSlot.split(' - ');
  const startDateTime = new Date(`${booking.date}T${startTimeStr.trim()}:00`);
  const endDateTime = new Date(`${booking.date}T${endTimeStr.trim()}:00`);

  const summary = `Entrenamiento Personal: ${booking.serviceTitle} - ${booking.clientName}`;
  const description = `
🏋️ SESIÓN DE ENTRENAMIENTO PERSONALIZADO
────────────────────────────────
👤 Cliente: ${booking.clientName}
📧 Email: ${booking.clientEmail}
📱 Teléfono: ${booking.clientPhone || 'No proporcionado'}
🎯 Objetivos/Metas: ${booking.clientGoals || 'Acondicionamiento físico general'}
📌 Modalidad: ${booking.trainingType === 'presencial' ? 'Presencial (Gimnasio / Estudio)' : 'Online en vivo'}
⏱️ Servicio: ${booking.serviceTitle} (${booking.serviceDurationMinutes} min)
💵 Tarifa: ${booking.servicePrice}
${booking.notes ? `📝 Notas adicionales: ${booking.notes}\n` : ''}
────────────────────────────────
Agendado a través de la plataforma web de Giovanni Mérida.
  `.trim();

  const eventPayload = {
    summary,
    description,
    location: booking.trainingType === 'presencial' ? 'Centro Deportivo Giovanni Mérida / Gimnasio' : 'Google Meet / Enlace Online',
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attendees: [
      { email: booking.clientEmail, displayName: booking.clientName },
      { email: booking.trainerEmail, responseStatus: 'accepted' },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 },
      ],
    },
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Calendar API Error:', errorText);
    throw new Error(`Error en Google Calendar (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result;
}

/**
 * Creates raw email RFC 2822 base64url encoded for Gmail API
 */
function createRawEmail({
  to,
  from,
  subject,
  bodyHtml,
}: {
  to: string;
  from?: string;
  subject: string;
  bodyHtml: string;
}) {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    from ? `From: ${from}` : '',
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    bodyHtml,
  ];

  const email = messageParts.filter(Boolean).join('\r\n');
  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends confirmation emails via Gmail API:
 * 1. Confirmation to client
 * 2. Notification to trainer
 */
export async function sendConfirmationEmails(
  accessToken: string,
  booking: BookingDetails,
  googleCalendarHtmlLink?: string
) {
  // 1. Email for client
  const clientHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #18181b; color: #f4f4f5; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
      <div style="background: linear-gradient(135deg, #d97706, #f59e0b); padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">¡Cita de Entrenamiento Confirmada!</h1>
        <p style="margin: 8px 0 0; color: #fef3c7; font-size: 15px;">Tu sesión con Giovanni Mérida ha sido reservada con éxito</p>
      </div>

      <div style="padding: 28px 24px;">
        <p style="font-size: 16px; line-height: 1.6; color: #e4e4e7;">
          Hola <strong>${booking.clientName}</strong>,
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #a1a1aa;">
          Estamos listos para llevar tu rendimiento al siguiente nivel. A continuación tienes todos los detalles de tu próxima sesión:
        </p>

        <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #3f3f46;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #e4e4e7;">
            <tr>
              <td style="padding: 8px 0; color: #fbbf24; font-weight: bold; width: 40%;">Servicio:</td>
              <td style="padding: 8px 0; font-weight: 600;">${booking.serviceTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #fbbf24; font-weight: bold;">Fecha:</td>
              <td style="padding: 8px 0;">${booking.date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #fbbf24; font-weight: bold;">Horario:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #34d399;">${booking.timeSlot}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #fbbf24; font-weight: bold;">Modalidad:</td>
              <td style="padding: 8px 0;">${booking.trainingType === 'presencial' ? 'Presencial (En Gimnasio)' : 'Online en vivo'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #fbbf24; font-weight: bold;">Duración:</td>
              <td style="padding: 8px 0;">${booking.serviceDurationMinutes} minutos</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #fbbf24; font-weight: bold;">Inversión:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #ffffff;">${booking.servicePrice}</td>
            </tr>
          </table>
        </div>

        ${
          googleCalendarHtmlLink
            ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${googleCalendarHtmlLink}" target="_blank" style="background-color: #f59e0b; color: #09090b; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
              Ver en Google Calendar
            </a>
          </div>
        `
            : ''
        }

        <div style="border-top: 1px solid #3f3f46; padding-top: 16px; margin-top: 24px; font-size: 13px; color: #71717a;">
          <p style="margin: 0 0 6px;">💡 <strong>Recomendaciones para tu sesión:</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Llega con ropa deportiva cómoda y calzado adecuado.</li>
            <li>Mantén una hidratación constante antes y durante el entrenamiento.</li>
            <li>Si requieres reagendar, avísanos con al menos 24 horas de antelación.</li>
          </ul>
        </div>
      </div>

      <div style="background-color: #09090b; padding: 16px 24px; text-align: center; font-size: 12px; color: #71717a;">
        Giovanni Mérida · Entrenador Personal Certificado · contacto@giovannimerida.com
      </div>
    </div>
  `;

  // 2. Email for trainer
  const trainerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #18181b; color: #f4f4f5; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
      <div style="background-color: #27272a; padding: 24px; border-bottom: 2px solid #f59e0b;">
        <h2 style="margin: 0; color: #fbbf24; font-size: 20px;">🔔 Nueva Reserva de Entrenamiento Agendada</h2>
        <p style="margin: 6px 0 0; color: #a1a1aa; font-size: 14px;">Se ha registrado una nueva sesión en tu calendario</p>
      </div>

      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #e4e4e7;">
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa; width: 35%;">Cliente:</td>
            <td style="padding: 6px 0; font-weight: bold;">${booking.clientName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Email:</td>
            <td style="padding: 6px 0;"><a href="mailto:${booking.clientEmail}" style="color: #60a5fa;">${booking.clientEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Teléfono:</td>
            <td style="padding: 6px 0;">${booking.clientPhone || 'No proporcionado'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Servicio:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #fbbf24;">${booking.serviceTitle}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Fecha y Hora:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #34d399;">${booking.date} | ${booking.timeSlot}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Modalidad:</td>
            <td style="padding: 6px 0;">${booking.trainingType.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Objetivos:</td>
            <td style="padding: 6px 0;">${booking.clientGoals || 'Sin especificar'}</td>
          </tr>
          ${booking.notes ? `
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Notas extras:</td>
            <td style="padding: 6px 0; font-style: italic;">${booking.notes}</td>
          </tr>
          ` : ''}
        </table>
      </div>
    </div>
  `;

  const clientRaw = createRawEmail({
    to: booking.clientEmail,
    subject: `Confirmación de Sesión de Entrenamiento: ${booking.serviceTitle} - ${booking.date}`,
    bodyHtml: clientHtml,
  });

  const trainerRaw = createRawEmail({
    to: booking.trainerEmail,
    subject: `[Nueva Reserva] ${booking.clientName} - ${booking.serviceTitle} (${booking.date} ${booking.timeSlot})`,
    bodyHtml: trainerHtml,
  });

  // Send to client
  const resClient = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: clientRaw }),
  });

  if (!resClient.ok) {
    const errorText = await resClient.text();
    console.error('Error enviando correo a cliente:', errorText);
  }

  // Send to trainer (if different email or self-notification)
  let resTrainer;
  if (booking.trainerEmail) {
    resTrainer = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: trainerRaw }),
    });
  }

  return {
    clientSent: resClient.ok,
    trainerSent: resTrainer ? resTrainer.ok : true,
  };
}

/**
 * Generate a web link so the client can click to add directly to their own Google Calendar or download .ics
 */
export function generateGoogleCalendarWebUrl(booking: BookingDetails): string {
  const [startTimeStr, endTimeStr] = booking.timeSlot.split(' - ');
  
  // Format as YYYYMMDDTHHMMSSZ or local YYYYMMDDTHHMMSS
  const formatTime = (timeStr: string) => {
    const cleanDate = booking.date.replace(/-/g, '');
    const cleanTime = timeStr.trim().replace(':', '') + '00';
    return `${cleanDate}T${cleanTime}`;
  };

  const datesParam = `${formatTime(startTimeStr)}/${formatTime(endTimeStr)}`;
  const title = encodeURIComponent(`Entrenamiento Personal: ${booking.serviceTitle} con Giovanni`);
  const details = encodeURIComponent(
    `Entrenamiento personal con Giovanni Mérida.\nModalidad: ${booking.trainingType}\nObjetivo: ${booking.clientGoals}\nTeléfono contacto: ${booking.clientPhone}`
  );
  const location = encodeURIComponent(
    booking.trainingType === 'presencial' ? 'Gimnasio / Estudio Giovanni Mérida' : 'Enlace Online'
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
}

/**
 * Generates an iCalendar (.ics) data URI for Apple Calendar, Outlook, etc.
 */
export function generateIcsDataUri(booking: BookingDetails): string {
  const [startTimeStr, endTimeStr] = booking.timeSlot.split(' - ');
  const formatIcsTime = (timeStr: string) => {
    return booking.date.replace(/-/g, '') + 'T' + timeStr.trim().replace(':', '') + '00';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Giovanni Merida//Personal Trainer App//ES',
    'BEGIN:VEVENT',
    `SUMMARY:Entrenamiento: ${booking.serviceTitle} - Giovanni Merida`,
    `DESCRIPTION:Sesión de entrenamiento personal (${booking.trainingType}).`,
    `LOCATION:${booking.trainingType === 'presencial' ? 'Estudio Giovanni Mérida' : 'Online'}`,
    `DTSTART:${formatIcsTime(startTimeStr)}`,
    `DTEND:${formatIcsTime(endTimeStr)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
}
