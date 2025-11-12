import { google } from 'googleapis';
import type { CalendarEventInput, CalendarEvent } from '../models/calendar.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Trouver le chemin du fichier credentials
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CREDENTIALS_PATH = path.join(__dirname, '../../google-credentials.json');

//Se connecte à Google avec les identifiants (email dans le json)
const getCalendarClient = () => {
  try {
    // Charger les identifiants depuis le fichier JSON
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/calendar'], // Permission d'accéder au calendrier
    });

    // Créer le client Calendar
    return google.calendar({ version: 'v3', auth });
  } catch (error) {
    throw new Error('Impossible de charger les identifiants Google. Vérifiez que google-credentials.json existe.');
  }
};

// Type de l'événement retourné
export interface CalendarEventOutput {
  id: string;
  htmlLink: string;
  summary: string;
  start: any;
  end: any;
}

//Créer un événement dans Google Calendar
export const createCalendarEvent = async (input: CalendarEventInput): Promise<CalendarEventOutput> => {
  const { summary, description, startDateTime, endDateTime, location } = input;

  // Validation basique
  if (!summary || !startDateTime || !endDateTime) {
    throw new Error('Titre, date de début et date de fin requis');
  }

  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // Créer l'événement
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary,           // Titre
        description,       // Description
        location,          // Lieu
        start: {
          dateTime: startDateTime,  // Date début
          timeZone: 'Europe/Paris', // Fuseau horaire
        },
        end: {
          dateTime: endDateTime,    // Date fin
          timeZone: 'Europe/Paris',
        },
      },
    });

    // Retourner les infos de l'événement créé
    return {
      id: response.data.id!,
      htmlLink: response.data.htmlLink!,
      summary: response.data.summary!,
      start: response.data.start!,
      end: response.data.end!,
    };
  } catch (error: any) {
    console.error('Erreur Google Calendar:', error);
    throw new Error('Impossible de créer l\'événement dans Google Calendar');
  }
};

// Supprimer un événement de Google Calendar
export const deleteCalendarEvent = async (eventId: string): Promise<void> => {
  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    await calendar.events.delete({
      calendarId,
      eventId,
    });
  } catch (error: any) {
    console.error('Erreur suppression événement:', error);
    throw new Error('Impossible de supprimer l\'événement du calendrier');
  }
};

//récupérer un événement existant dans Google Calendar
export const getCalendarEvent = async (eventId: string): Promise<CalendarEventOutput | null> => {
  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    const response = await calendar.events.get({
      calendarId,
      eventId,
    });

    return {
      id: response.data.id!,
      htmlLink: response.data.htmlLink!,
      summary: response.data.summary!,
      start: response.data.start!,
      end: response.data.end!,
    };
  } catch (error: any) {
    return null;
  }
};