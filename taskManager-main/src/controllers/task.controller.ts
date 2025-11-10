import type { Request, Response } from 'express';
import * as taskService from '../services/task.service.js';

// Gère la requête et la réponse  


//Récupère toutes les tâches de l'utilisateur connecté
export const listTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const tasks = await taskService.getUserTasks(userId);
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

//Créer une nouvelle tâche
export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const task = await taskService.createTask({ ...req.body, userId });
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Modifier une tâche
export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id!);
    const userId = req.user!.id;
    const task = await taskService.updateTask(taskId, userId, req.body);
    res.status(200).json(task);
  } catch (error: any) {
    if (error.message.includes('non trouvée')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Accès refusé')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};


//Supprimer une tache 
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id!);
    const userId = req.user!.id;
    await taskService.deleteTask(taskId, userId);
    res.status(200).json({ message: 'Tâche supprimée' });
  } catch (error: any) {
    if (error.message.includes('non trouvée')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('refusée')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

//Ajouter un collaborateur à une tâche
export const addCollaborator = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id!);
    const ownerId = req.user!.id;
    const { userId } = req.body;

    await taskService.addCollaborator(taskId, ownerId, userId);
    res.status(200).json({ message: 'Collaborateur ajouté' });
  } catch (error: any) {
    if (error.message.includes('non trouvée') || error.message.includes('non trouvé')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('refusée') || error.message.includes('déjà')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

//Retirer un collaborateur d'une tâche
export const removeCollaborator = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id!);
    const ownerId = req.user!.id;
    const collaboratorId = parseInt(req.params.userId!);

    await taskService.removeCollaborator(taskId, ownerId, collaboratorId);
    res.status(200).json({ message: 'Collaborateur retiré' });
  } catch (error: any) {
    if (error.message.includes('non trouvée') || error.message.includes('non trouvé')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('refusée')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};