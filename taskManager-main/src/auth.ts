import express from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from "./resources/users.js";
import { initializeDatabase } from "./database.js";

const router = express.Router();

// Configuration JWT
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'access_secret_key';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Interface pour le payload JWT
interface JwtPayload {
  id: number;
  name: string;
}

// Fonction pour générer les tokens
function generateAccessToken(user: { id: number; name: string }): string {
  return jwt.sign(
    { id: user.id, name: user.name },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function generateRefreshToken(user: { id: number; name: string }): string {
  return jwt.sign(
    { id: user.id, name: user.name },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

// Initialize database
let dbPromise = initializeDatabase();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Nom et mot de passe requis' });
    }

    // Vérifier si l'utilisateur existe
    const existingUser = users.find(u => u.name === name);
    if (existingUser) {
      return res.status(409).json({ error: 'Utilisateur déjà existant' });
    }

    // Hash du mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const newUser = {
      id: users.length + 1,
      name,
      password: hashedPassword,
      is_login: false,
    };

    users.push(newUser);

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      user: { id: newUser.id, name: newUser.name }
    });
  } catch (error) {
    console.error('Erreur signup:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: 'Nom et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const user = users.find(u => u.name === name);
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Générer les tokens
    const accessToken = generateAccessToken({ id: user.id, name: user.name });
    const refreshToken = generateRefreshToken({ id: user.id, name: user.name });

    // Stocker le refresh token dans la base de données
    const db = await dbPromise;
    await db.run(
      'INSERT INTO refresh_tokens (userId, token, createdAt) VALUES (?, ?, ?)',
      [user.id, refreshToken, new Date().toISOString()]
    );
    
    // Marquer l'utilisateur comme connecté
    user.is_login = true;

    // Envoyer les tokens
    res.status(200).json({
      message: 'Connexion réussie',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// REFRESH TOKEN
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requis' });
    }

    // Vérifier si le token existe dans la base de données
    const db = await dbPromise;
    const storedToken = await db.get(
      'SELECT * FROM refresh_tokens WHERE token = ?',
      [refreshToken]
    );
    
    if (!storedToken) {
      return res.status(403).json({ error: 'Refresh token non reconnu' });
    }

    // Vérifier la validité du token JWT
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Refresh token invalide ou expiré' });
      }

      const payload = decoded as JwtPayload;

      // Trouver l'utilisateur
      const user = users.find(u => u.id === payload.id);

      if (!user) {
        return res.status(403).json({ error: 'Utilisateur non trouvé' });
      }

      // Générer un nouveau access token
      const newAccessToken = generateAccessToken({ id: user.id, name: user.name });

      res.status(200).json({
        accessToken: newAccessToken
      });
    });
  } catch (error) {
    console.error('Erreur refresh:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// LOGOUT
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requis' });
    }

    // Trouver et supprimer le token dans la base de données
    const db = await dbPromise;
    const storedToken = await db.get(
      'SELECT * FROM refresh_tokens WHERE token = ?',
      [refreshToken]
    );

    if (storedToken) {
      // Marquer l'utilisateur comme déconnecté
      const user = users.find(u => u.id === storedToken.userId);
      if (user) {
        user.is_login = false;
      }

      // Supprimer le token de la base de données
      await db.run('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    }

    res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur logout:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;