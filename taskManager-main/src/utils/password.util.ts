import bcrypt from 'bcryptjs';

export const isValidPassword = (password: string): boolean => {
  if (!password || password.length < 8) return false; //Au moins 8 caractères
  
  const hasUppercase = /[A-Z]/.test(password);  // Au moins 1 majuscule
  const hasLowercase = /[a-z]/.test(password);  //Au moins 1 minuscule
  const hasDigit = /\d/.test(password); //Au moins 1 chiffre
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);  //Au moins 1 caractère spécial
  
  return hasUppercase && hasLowercase && hasDigit && hasSpecialChar;
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
 