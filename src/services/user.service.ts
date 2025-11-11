import { getDb } from '../db/database.js';
import type { User, UserResponse } from '../models/user.model.js';

// Récupérer tous les utilisateurs

export const getAllUsers = async (): Promise <UserResponse[]>=> {
  const db = getDb();
  const users = await db.all('SELECT id, name, is_login FROM users');
  return users.map((u: any) => ({
    id: u.id,
    name: u.name,
    is_login: Boolean(u.is_login)
  }));
};

// Récupérer un utilisateur par ID

export const getUserById = async (id: number): Promise<UserResponse | null> => {
  const db = getDb();
  const user = await db.get('SELECT id, name, is_login FROM users WHERE id = ?', [id]);
  
  if (!user) return null;
  
  return {
    id: user.id,
    name: user.name,
    is_login: Boolean(user.is_login)
  };
};

// Mettre à jour un utilisateur

export const updateUser = async (
  id: number,
  requestUserId: number,
  name: string
): Promise<UserResponse> => {
  if (id !== requestUserId) {
    throw new Error('Vous ne pouvez modifier que votre propre profil');
  }

  if (!name || name.trim() === '') {
    throw new Error('Le nom est requis');
  }

  const db = getDb();

  const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  await db.run('UPDATE users SET name = ? WHERE id = ?', [name, id]);

  return { id, name, is_login: Boolean(user.is_login) };
};

// Supprimer un utilisateur

export const deleteUser = async (id: number): Promise<void>  => {
  const db = getDb();

  const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  await db.run('DELETE FROM users WHERE id = ?', [id]);
};