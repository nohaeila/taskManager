import bcrypt from 'bcryptjs';

export interface PasswordValidationResult{
    isValid: boolean;
    errors: string[];

}

//erreurs detaillées pour la validation de mot de passe 
export const validatePasswordDetailed = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  // Vérifier la longueur
  if (!password || password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  // Vérifier la majuscule
  if (!/[A-Z]/.test(password)){
    errors.push('Le mot de passe doit contenir au moins 1 majuscule (A-Z)');
  }

  // Vérifier la minuscule
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins 1 minuscule (a-z)');
  }

  // Vérifier le chiffre
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins 1 chiffre (0-9)');
  }

  // Vérifier le caractère spécial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins 1 caractère spécial (!@#$%^&*(),.?":{}|<>)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Ancienne fonction (pour compatibilité avec les tests)
export const isValidPassword = (password: string): boolean => {
    return validatePasswordDetailed(password).isValid;
};

// Hash un mot de passe
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
  return await bcrypt.hash(password, saltRounds);
};

// Compare un mot de passe avec son hash
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
 