import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';

// Gère la requête et la réponse


//Créer un nouveau compte utilisateur
export const signup = async (req: Request, res: Response) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user
    });
  } catch (error: any) {
    if (error.message.includes('déjà existant')) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes('requis') || error.message.includes('mot de passe')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

//Se connecter 
export const login = async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;
    const result = await authService.login(name, password);
    res.status(200).json({
      message: 'Connexion réussie',
      ...result
    });
  } catch (error: any) {
    if (error.message.includes('requis')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('Identifiants')) {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

//Renouveler le token d'accès
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message.includes('requis')) {
      return res.status(401).json({ error: error.message });
    }
    res.status(403).json({ error: 'Refresh token invalide ou expiré' });
  }
};

//se deconnecter
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (error: any) {
    if (error.message.includes('requis')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};