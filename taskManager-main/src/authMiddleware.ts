import express from 'express';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { tasks } from './resources/tasks.js';

// Stock les informations de l'user authentifié après vérification du token
declare global {
  namespace Express {
    interface Request {
      user?: any ; 
    }
  }
}

const router = express.Router();
const secretKey = process.env.JWT_SECRET || 'ma_cle_secrete';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).send('Token requis');

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).send('Token invalide ou expiré');
    req.user = user;
    next();
  });
};

// Route pour afficher les tâches de l'utilisateur authentifié
router.get('/tasks', authenticateToken, (req: Request, res: Response) => {
  const userTasks = tasks.filter(t => t.userId === req.user.id);
  res.status(200).json(userTasks);
});


export default router;