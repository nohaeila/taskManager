import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { requestLogger } from '../middlewares/logger.middleware.js';

const router = Router();

router.get('/users', requestLogger, userController.listUsers);
router.put('/users/:id', authenticateToken, userController.updateUser);
export default router;