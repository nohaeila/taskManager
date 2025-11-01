import type { Request, Response, NextFunction } from 'express';
import { tasks } from './resources/tasks.js';

// Vérifier que l'utilisateur est propriétaire de la tâche
export const checkTaskOwner = (req: Request, res: Response, next: NextFunction) => {
  const idParam = req.params.id;
  
  if (!idParam) {
    return res.status(400).json({ error: "ID manquant" });
  }
  
  const taskId = parseInt(idParam);
  const userId = req.user!.id;

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Tâche non trouvée' });
  }

  // Seul le propriétaire peut effectuer cette action
  if (task.userId !== userId) {
    return res.status(403).json({ 
      error: 'Action refusée : seul le propriétaire peut effectuer cette action' 
    });
  }

  next();
};

// Vérifier que l'utilisateur a accès à la tâche (owner OU collaborateur)
export const checkTaskAccess = (req: Request, res: Response, next: NextFunction) => {
  const idParam = req.params.id;
  
  if (!idParam) {
    return res.status(400).json({ error: "ID manquant" });
  }
  
  const taskId = parseInt(idParam);
  const userId = req.user!.id;

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Tâche non trouvée' });
  }

  // L'utilisateur doit être propriétaire OU collaborateur
  const hasAccess = task.userId === userId || task.collaboratorId.includes(userId);

  if (!hasAccess) {
    return res.status(403).json({ 
      error: 'Accès refusé : vous n\'avez pas les droits sur cette tâche' 
    });
  }

  next();
};