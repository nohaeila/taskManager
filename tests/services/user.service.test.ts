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
      const mockUsers = [
        { id: 1, name: 'User1', is_login: 0 },
        { id: 2, name: 'User2', is_login: 1 }
      ];
      mockDb.all.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, name: 'User1', is_login: false });
      expect(result[1]).toEqual({ id: 2, name: 'User2', is_login: true });
    });

    it('should throw on database error', async () => {
      mockDb.all.mockRejectedValue(new Error('DB Error'));

      await expect(userService.getAllUsers()).rejects.toThrow();
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

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', [1]);
    });
  });
});