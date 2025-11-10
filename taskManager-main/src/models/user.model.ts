// Interface d'un utilisateur
export interface User {
  id: number;
  name: string;
  password: string;
  is_login: boolean;
}

// Pour créer un nouvel utilisateur
export interface UserCreateInput {
  name: string;
  password: string;
}

// Pour retourner un utilisateur 
export interface UserResponse {
  id: number;
  name: string;
  is_login: boolean;
}