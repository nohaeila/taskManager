import * as authService from '../../src/services/auth.service.js';
import { getDb } from '../../src/db/database.js';
import * as passwordUtil from '../../src/utils/password.util.js';

const mockValidatePasswordDetailed = jest.spyOn(passwordUtil, 'validatePasswordDetailed');
const mockHashPassword = jest.spyOn(passwordUtil, 'hashPassword');
const mockComparePassword = jest.spyOn(passwordUtil, 'comparePassword');

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
    jest.clearAllMocks(); // réinitialise les mocks avant chaque test
    (getDb as jest.Mock).mockReturnValue(mockDb);

    mockValidatePasswordDetailed.mockReset();
    mockHashPassword.mockReset();
    mockComparePassword.mockReset();
  });

  // Tests de la fonction signup
  describe('signup', () => {
    it('should throw if name or password is missing', async () => {
      // Nom vide
      await expect(authService.signup({ name: '', password: 'Test123@' }))
        .rejects.toThrow('Nom et mot de passe requis');
      //mdp vide
      await expect(authService.signup({ name: 'Test', password: '' }))
        .rejects.toThrow('Nom et mot de passe requis');
    });
    //mdp invalide
    it('should throw if password is invalid', async () => {
    mockValidatePasswordDetailed.mockReturnValue({
        isValid: false,
        errors: ['Le mot de passe doit contenir au moins 8 caractères']
    });

    await expect(authService.signup({ name: 'Test', password: 'weak' }))
        .rejects.toThrow('Le mot de passe doit contenir au moins 8 caractères');
    });

    it('should throw if user already exists', async () => {
    mockValidatePasswordDetailed.mockReturnValue({
        isValid: true,
        errors: []
    });

    mockDb.get.mockResolvedValue({ id: 1, name: 'ExistingUser' });

    await expect(authService.signup({ name: 'ExistingUser', password: 'Valid123@' }))
        .rejects.toThrow('Utilisateur déjà existant');
    });

    //Création de l'utilisateur 
    it('should create user successfully', async () => {
    mockValidatePasswordDetailed.mockReturnValue({
        isValid: true,
        errors: []
    });
    mockHashPassword.mockResolvedValue('hashedPassword');
    mockDb.get.mockResolvedValue(null);
    mockDb.run.mockResolvedValue({ lastID: 1 });

    const result = await authService.signup({ name: 'NewUser', password: 'Valid123@' });

    expect(result).toEqual({ id: 1, name: 'NewUser' });
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
    it('should throw if password is incorrect', async () => {
      mockDb.get.mockResolvedValue({ id: 1, name: 'User', password: 'hashedPass' });
      (passwordUtil.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('User', 'wrongpass'))
        .rejects.toThrow('Identifiants invalides');
    });

    it('should login successfully', async () => {
      mockDb.get.mockResolvedValue({ id: 1, name: 'User', password: 'hashedPass' });
      (passwordUtil.comparePassword as jest.Mock).mockResolvedValue(true);
      mockDb.run.mockResolvedValue({});

      const result = await authService.login('User', 'correctpass');

      expect(result).toHaveProperty('accessToken'); // vérifie qu’on a un token
      expect(result).toHaveProperty('refreshToken');// vérifie qu’on a un refresh token
      expect(result.user).toEqual({ id: 1, name: 'User' });// vérifie les infos utilisateur
    });
  });

  //Tests pour le refresh token
  describe('refreshToken', () => {
    it('should throw if token is missing', async () => {
      await expect(authService.refreshToken(''))
        .rejects.toThrow('Refresh token requis');
    });

    it('should throw if token not found in database', async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(authService.refreshToken('invalidtoken'))
        .rejects.toThrow('Refresh token non reconnu');
    });
  });

  //Tests pour la deconnexion
  describe('logout', () => {
    it('should throw if token is missing', async () => {
      await expect(authService.logout(''))
        .rejects.toThrow('Refresh token requis');
    });

    it('should logout successfully', async () => {
      mockDb.get.mockResolvedValue({ userId: 1, token: 'token123' });
      mockDb.run.mockResolvedValue({});

      await authService.logout('token123');
    // Vérifie que l’utilisateur est marqué comme déconnecté
      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE users SET is_login = 0 WHERE id = ?',
        [1]
      );
      // Vérifie que le refresh token est supprimé
      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM refresh_tokens WHERE token = ?',
        ['token123']
      );
    });

    it('should handle logout when token not found', async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(authService.logout('invalidtoken')).resolves.not.toThrow();
    });
  });
});
