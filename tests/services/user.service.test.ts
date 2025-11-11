import * as userService from '../../src/services/user.service.js';
import { getDb } from '../../src/db/database.js';

jest.mock('../../src/db/database', () => ({
  getDb: jest.fn()
}));

const mockDb = {
  get: jest.fn(),
  run: jest.fn(),
  all: jest.fn()
};

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockReturnValue(mockDb);
  });

  // Tests de récupération des utilisateurs
  describe('getAllUsers', () => {
    it('should return all users', async () => {

      // Simule une liste d’utilisateurs renvoyée par la base
      const mockUsers = [
        { id: 1, name: 'User1', is_login: 0 },
        { id: 2, name: 'User2', is_login: 1 }
      ];
      mockDb.all.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toHaveLength(2); // Vérifie que la fonction retourne bien les deux utilisateurs
      expect(result[0]).toEqual({ id: 1, name: 'User1', is_login: false }); // Vérifie que le premier utilisateur a les bonnes infos
      expect(result[1]).toEqual({ id: 2, name: 'User2', is_login: true });// Vérifie que le deuxième a bien "is_login" à true
    });

    it('should throw on database error', async () => { // Simule une erreur dans la base de données
      mockDb.all.mockRejectedValue(new Error('DB Error')); // Vérifie que la fonction renvoie bien une erreur

      await expect(userService.getAllUsers()).rejects.toThrow();
    });
  });

//Tests pour récupérer un utilisateur avec son ID
    describe('getUserById', () => {
    it('should return user if found', async () => {
      mockDb.get.mockResolvedValue({ id: 1, name: 'User1', is_login: 0 });

      const result = await userService.getUserById(1);

      // Vérifie que les infos de l’utilisateur sont correctes
      expect(result).toEqual({ id: 1, name: 'User1', is_login: false });
    });

    it('should return null if user not found', async () => {
      mockDb.get.mockResolvedValue(null);

      const result = await userService.getUserById(999);

      expect(result).toBeNull();
    });
  });

// Tests de modification d'utilisateur
  describe('updateUser', () => {
    it('should throw if user tries to update another profile', async () => {
      await expect(userService.updateUser(1, 2, 'NewName'))
        .rejects.toThrow('Vous ne pouvez modifier que votre propre profil');
    });

    it('should throw if name is empty', async () => {
      await expect(userService.updateUser(1, 1, ''))
        .rejects.toThrow('Le nom est requis');
    });

    it('should throw if user not found', async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(userService.updateUser(1, 1, 'NewName'))
        .rejects.toThrow('Utilisateur non trouvé');
    });

    it('should update user successfully', async () => {
      mockDb.get.mockResolvedValue({ id: 1, name: 'OldName', is_login: 0 });
      mockDb.run.mockResolvedValue({});

      const result = await userService.updateUser(1, 1, 'NewName');

      expect(result).toEqual({ id: 1, name: 'NewName', is_login: false });
      expect(mockDb.run).toHaveBeenCalledWith('UPDATE users SET name = ? WHERE id = ?', ['NewName', 1]);
    });
  });

  // Tests de suppression d'utilisateur
  describe('deleteUser', () => {
    it('should throw if user not found', async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(userService.deleteUser(1))
        .rejects.toThrow('Utilisateur non trouvé');
    });

    it('should delete user successfully', async () => {
      mockDb.get.mockResolvedValue({ id: 1, name: 'User1' });
      mockDb.run.mockResolvedValue({});

      await userService.deleteUser(1);

      // Vérifie que la requête SQL DELETE a bien été exécutée
      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', [1]);
    });
  });
});