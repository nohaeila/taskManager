import { isValidPassword } from '../../src/utils/password.util.js';

describe('Password validation', () => {
  it('should reject empty password', () => {
    expect(isValidPassword("")).toBe(false);
  });

  it('should reject short password', () => {
    expect(isValidPassword("A1b@")).toBe(false);
  });

  it('should reject password without uppercase', () => {
    expect(isValidPassword("abcd1234@")).toBe(false);
  });

  it('should reject password without lowercase', () => {
    expect(isValidPassword("ABCD1234@")).toBe(false);
  });

  it('should reject password without digit', () => {
    expect(isValidPassword("Abcdefgh@")).toBe(false);
  });

  it('should reject password without special character', () => {
    expect(isValidPassword("Abcd1234")).toBe(false);
  });

  it('should accept valid password', () => {
    expect(isValidPassword("Abcde123@")).toBe(true);
  });

  it('should accept password with multiple special characters', () => {
    expect(isValidPassword("Test123!@#")).toBe(true);
  });

  it('should reject password with only 7 characters', () => {
    expect(isValidPassword("Abc12@")).toBe(false);
  });
});