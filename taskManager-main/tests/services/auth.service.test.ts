import * as authService from '../../src/services/auth.service.js';
import { getDb } from '../../src/db/database.js';

// Mock de la base de données
jest.mock('../../src/db/database', () => ({
  getDb: jest.fn()
}));

const mockDb = {
  get: jest.fn(),
  run: jest.fn(),
  all: jest.fn()
};

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockReturnValue(mockDb);
  });

  // Tests de la fonction signup
  describe('signup', () => {
    it('should throw if name or password is missing', async () => {
      await expect(authService.signup({ name: '', password: 'Test123@' }))
        .rejects.toThrow('Nom et mot de passe requis');
      
      await expect(authService.signup({ name: 'Test', password: '' }))
        .rejects.toThrow('Nom et mot de passe requis');
    });

    it('should throw if password is invalid', async () => {
      await expect(authService.signup({ name: 'Test', password: 'weak' }))
        .rejects.toThrow('Le mot de passe doit contenir');
    });

    it('should throw if user already exists', async () => {
      mockDb.get.mockResolvedValue({ id: 1, name: 'ExistingUser' });

      await expect(authService.signup({ name: 'ExistingUser', password: 'Valid123@' }))
        .rejects.toThrow('Utilisateur déjà existant');
    });

    it('should create user successfully', async () => {
      mockDb.get.mockResolvedValue(null);
      mockDb.run.mockResolvedValue({ lastID: 1 });

      const result = await authService.signup({ name: 'NewUser', password: 'Valid123@' });

      expect(result).toEqual({ id: 1, name: 'NewUser' });
      expect(mockDb.run).toHaveBeenCalled();
    });
  });

  // Tests de la fonction login
  describe('login', () => {
    it('should throw if credentials are missing', async () => {
      await expect(authService.login('', 'password'))
        .rejects.toThrow('Nom et mot de passe requis');
      
      await expect(authService.login('user', ''))
        .rejects.toThrow('Nom et mot de passe requis');
    });

    it('should throw if user not found', async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(authService.login('Unknown', 'password'))
        .rejects.toThrow('Identifiants invalides');
    });
  });
});