export interface CalendarEventInput {
  taskId: number;
  summary: string;        // Titre de l'événement 
  description?: string;   // Description optionnelle
  startDateTime: string;  // Date de début 
  endDateTime: string;    // Date de fin
  location?: string;      // Lieu optionnel
}

// Ce que Google Calendar renvoie
export interface CalendarEvent {
  id: string;            // ID de l'événement créé
  htmlLink: string;      // Lien vers l'événement dans Google Calendar
  summary: string;
  start: {
    dateTime: string;
  };
  end: {
    dateTime: string;
  };
}