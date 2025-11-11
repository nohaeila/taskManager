import type { Request, Response } from 'express';
import * as userService from '../services/user.service.js';

//Récupérer la liste de tous les utilisateurs
export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

//Modifier son propre profil
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    const userId = req.user!.id;
    const { name } = req.body;

    const user = await userService.updateUser(id, userId, name);
    res.status(200).json(user);
  } catch (error: any) {
    if (error.message.includes('modifier que votre')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('non trouvé')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

