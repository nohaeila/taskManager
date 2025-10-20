export interface User {
  id: number;
  name: string;
  is_login: boolean;
}

export const users: User[] = [
  { id: 1, name: "Jean", is_login: false },
  { id: 2, name: "Bob", is_login: false }
];
