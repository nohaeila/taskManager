export interface Task {
  id: number;
  name: string;
  description: string;
  is_done: boolean;
  userId: number;
  collaboratorId: number[];
}

export const tasks: Task[] = [
  { id: 1, name: "Projet1", description: "Développer un jeu", is_done: false, userId: 1,  collaboratorId: [2] },// Jean (propriétaire), Bob (collaborateur)
  { id: 2, name: "Projet2", description: "Développer un site web", is_done: false, userId: 2, collaboratorId: [] } // Bob (propriétaire), pas de collaborateurs
];

