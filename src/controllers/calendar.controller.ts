import type { Request, Response } from 'express';
import * as calendarService from '../services/calendar.service.js';

/* reception des requêtes HTTP
 * appellent le service Google Calendar
 * renvoient les résultats au client
*/


//Créer un événement dans Google Calendar
//POST 
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { summary, description, startDateTime, endDateTime, location } = req.body;

    // Créer l'événement
    const event = await calendarService.createCalendarEvent({
      taskId: 0, // Pas utilisé pour l'instant
      summary,
      description,
      startDateTime,
      endDateTime,
      location,
    });

    res.status(201).json({
      message: 'Événement créé dans Google Calendar',
      event,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

//Récupérer un événement
//GET
export const getEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const event = await calendarService.getCalendarEvent(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    res.status(200).json(event);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

//Supprimer un événement
//DELETE
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    await calendarService.deleteCalendarEvent(eventId);

    res.status(200).json({ message: 'Événement supprimé du calendrier' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
