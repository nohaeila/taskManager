import { getDb } from '../db/database.js';
import type { User, UserCreateInput } from '../models/user.model.js';
import { isValidPassword, hashPassword, comparePassword, validatePasswordDetailed } from '../utils/password.util.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util.js';

// Créer un nouvel utilisateur

export const signup = async (input: UserCreateInput): Promise<{ id: number; name: string }> => {
  const { name, password } = input;

  if (!name || !password) {
    throw new Error('Nom et mot de passe requis');
  }

  // validation de mdp détaillée
  const validation = validatePasswordDetailed(password);
  
  if (!validation.isValid) {
    // Créer un message avec toutes les erreurs
    const errorMessage = validation.errors.join('. ');
    throw new Error(errorMessage);
  }

  const db = getDb();

  // Vérifier si l'utilisateur existe
  const existingUser = await db.get('SELECT * FROM users WHERE name = ?', [name]);
  if (existingUser) {
    throw new Error('Utilisateur déjà existant');
  }

  // Hash du mot de passe
  const hashedPassword = await hashPassword(password);

  // Créer l'utilisateur
  const result = await db.run(
    'INSERT INTO users (name, password, is_login) VALUES (?, ?, 0)',
    [name, hashedPassword]
  );

  return { id: result.lastID!, name };
};

// LOGIN

export const login = async (
  name: string,
  password: string
): Promise <{ accessToken: string; refreshToken: string; user: { id: number; name: string } }>=> {
  if (!name || !password) {
    throw new Error('Nom et mot de passe requis');
  }

  const db = getDb();

  // Trouver l'utilisateur
  const user = await db.get('SELECT * FROM users WHERE name = ?', [name]);
  if (!user) {
    throw new Error('Identifiants invalides');
  }

  // Vérifier le mot de passe
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Identifiants invalides');
  }

  // Générer les tokens
  const accessToken = generateAccessToken({ id: user.id, name: user.name });
  const refreshToken = generateRefreshToken({ id: user.id, name: user.name });

  // Stocker le refresh token
  await db.run(
    'INSERT INTO refresh_tokens (userId, token, createdAt) VALUES (?, ?, ?)',
    [user.id, refreshToken, new Date().toISOString()]
  );

  // Marquer l'utilisateur comme connecté
  await db.run('UPDATE users SET is_login = 1 WHERE id = ?', [user.id]);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name }
  };
};

// Refresh token

export const refreshToken = async (token: string): Promise <{ accessToken: string }> => {
  if (!token) {
    throw new Error('Refresh token requis');
  }

  const db = getDb();

  // Vérifier si le token existe
  const storedToken = await db.get('SELECT * FROM refresh_tokens WHERE token = ?', [token]);
  if (!storedToken) {
    throw new Error('Refresh token non reconnu');
  }

  // Vérifier la validité du token JWT
  const { verifyRefreshToken } = await import('../utils/jwt.util.js');
  const payload = verifyRefreshToken(token);

  // Générer un nouveau access token
  const newAccessToken = generateAccessToken({ id: payload.id, name: payload.name });

  return { accessToken: newAccessToken };
};

// Déconnexion

export const logout = async (token: string): Promise<void> => {
  if (!token) {
    throw new Error('Refresh token requis');
  }

  const db = getDb();

  // Trouver le token
  const storedToken = await db.get('SELECT * FROM refresh_tokens WHERE token = ?', [token]);

  if (storedToken) {
    // Marquer l'utilisateur comme déconnecté
    await db.run('UPDATE users SET is_login = 0 WHERE id = ?', [storedToken.userId]);

    // Supprimer le token
    await db.run('DELETE FROM refresh_tokens WHERE token = ?', [token]);
  }
};


// Nettoyer les refresh tokens expirés

export const cleanExpiredTokens = async (): Promise<void> => {
  const db = getDb();
  
  // Supprimer les tokens de plus de 7 jours
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  await db.run(
    'DELETE FROM refresh_tokens WHERE createdAt < ?',
    [sevenDaysAgo]
  );
  
  // Mettre is_login à false pour les utilisateurs sans token valide
  await db.run(`
    UPDATE users 
    SET is_login = 0 
    WHERE id NOT IN (
      SELECT DISTINCT userId FROM refresh_tokens
    )
  `);
};