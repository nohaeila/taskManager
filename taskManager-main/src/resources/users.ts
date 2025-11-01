
export interface User {
  id: number;
  name: string;
  password: string;
  is_login: boolean;
  refreshToken?: string | undefined;
}

export const users: User[] = [
  { id: 1, name: "Jean", password: '', is_login: false },
  { id: 2, name: "Bob", password: '', is_login: false }
];