export interface Task {
  id: number;
  name: string;
  description: string;
  is_done: boolean;
}

export const tasks: Task[] = [
  { id: 1, name: "Projet1", description: "Développer un jeu", is_done: false },
  { id: 2, name: "Projet2", description: "Développer un site web", is_done: false }
];

