import express from 'express';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { tasks } from './resources/tasks.js';

// Interface pour le payload JWT
interface JwtPayload {
  id: number;
  name: string;
}

// Étendre l'interface Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const router = express.Router();
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'access_secret_key';

// Authentification
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    
    req.user = decoded as JwtPayload;
    next();
  });
};

// Route pour afficher les tâches de l'utilisateur authentifié
router.get('/tasks', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user!.id;
  
  // Tâches où l'utilisateur est propriétaire OU collaborateur
  const userTasks = tasks.filter(
    t => t.userId === userId || t.collaboratorId.includes(userId)
  );
  
  res.status(200).json(userTasks);
});

export default router;