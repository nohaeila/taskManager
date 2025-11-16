// Sert à déclarer les endpoints

import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requestLogger } from '../middlewares/logger.middleware.js';

const router = Router();

router.get('/tasks', authenticateToken, requestLogger, taskController.listTasks);
router.post('/tasks', authenticateToken, requestLogger, taskController.createTask);
router.get('/tasks/:id', authenticateToken, taskController.findOne);
router.put('/tasks/:id', authenticateToken, taskController.updateTask);
router.delete('/tasks/:id', authenticateToken, taskController.deleteTask);
router.post('/tasks/:id/collaborators', authenticateToken, taskController.addCollaborator);
router.delete('/tasks/:id/collaborators/:userId', authenticateToken, taskController.removeCollaborator);

export default router;