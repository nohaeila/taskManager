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

   // Stockage du refresh token dans un cookie HTTP-Only 
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,        
      secure: true,          
      sameSite: 'strict',    
      maxAge: 7 * 24 * 60 * 60 * 1000 //  durée vie cookie, ici 7 jours
    });

    // Renvoyer seulement l'access token
    res.status(200).json({
      message: 'Connexion réussie',
      accessToken: result.accessToken,
      user: result.user
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
    // Récupérer le refresh token depuis les cookies
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requis' });
    }

    const result = await authService.refreshToken(refreshToken);
    res.status(200).json({
        accessToken: result.accessToken
    });
  } catch (error: any) {
    res.status(403).json({ error: 'Refresh token invalide ou expiré' });
  }
};

//se deconnecter
export const logout = async (req: Request, res: Response) => {
  try {
    // Récupérer le refresh token depuis les cookies
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    // Supprimer le cookie
    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};