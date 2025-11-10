
// Interface principale d'une tâche
export interface Task {
  id: number;
  name: string;
  description: string;
  is_done: boolean;
  userId: number;
  collaboratorId?: number[];
}

// Pour créer une nouvelle tâche
export interface TaskCreateInput {
  name: string;
  description: string;
  userId: number;
}

// Pour modifier une tâche 
export interface TaskUpdateInput {
  name?: string;
  description?: string;
  is_done?: boolean;
}