import { Router } from 'express';
import * as calendarController from '../controllers/calendar.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Créer un événement dans Google Calendar
router.post('/calendar/events', authenticateToken, calendarController.createEvent);

// Récupérer un événement
router.get('/calendar/events/:eventId', authenticateToken, calendarController.getEvent);

// Supprimer un événement
router.delete('/calendar/events/:eventId', authenticateToken, calendarController.deleteEvent);

export default router;