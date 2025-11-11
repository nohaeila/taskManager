import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../src/utils/jwt.util.js';

describe('JWT Utilities', () => {
  const mockUser = { id: 1, name: 'TestUser' };

  // Tests pour la génération d'access token
  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should include user data in token', () => {
      const token = generateAccessToken(mockUser);
      const decoded = verifyAccessToken(token);
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.name).toBe(mockUser.name);
    });
  });

// Tests pour la génération de refresh token
  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should include user data in refresh token', () => {
      const token = generateRefreshToken(mockUser);
      const decoded = verifyRefreshToken(token);
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.name).toBe(mockUser.name);
    });
  });

  // Tests pour la vérification d'access token
  describe('verifyAccessToken', () => {
    it('should throw error for invalid token', () => {
      expect(() => verifyAccessToken('invalid_token')).toThrow();
    });

    it('should verify valid access token', () => {
      const token = generateAccessToken(mockUser);
      const decoded = verifyAccessToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser.id);
    });
  });

  // Tests pour la vérification de refresh token
  describe('verifyRefreshToken', () => {
    it('should throw error for invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid_token')).toThrow();
    });

    it('should verify valid refresh token', () => {
      const token = generateRefreshToken(mockUser);
      const decoded = verifyRefreshToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser.id);
    });
  });
});