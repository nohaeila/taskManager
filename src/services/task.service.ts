import { getDb } from '../db/database.js';
import type { Task, TaskCreateInput, TaskUpdateInput } from '../models/task.model.js';


//Récupérer les tâches paginées 
export const findAllPaginated = async (
  userId: number,
  page: number = 1,
  perPage: number = 3
): Promise<{ items: Task[]; total: number; page: number; perPage: number }> => {
  const db = getDb();

  // Calculer le skip
  const skip = (page - 1) * perPage;

  //Compter le total 
  const countResult = await db.get(`
    SELECT COUNT(DISTINCT t.id) as total
    FROM tasks t
    LEFT JOIN task_collaborators tc ON t.id = tc.taskId
    WHERE t.userId = ? OR tc.userId = ?
  `, [userId, userId]);

  const total = countResult?.total ?? 0;

  //Récupérer les tâches avec ORDER BY DESC + LIMIT + OFFSET
  const tasks = await db.all(`
    SELECT DISTINCT t.* 
    FROM tasks t
    LEFT JOIN task_collaborators tc ON t.id = tc.taskId
    WHERE t.userId = ? OR tc.userId = ?
    ORDER BY t.id DESC
    LIMIT ? OFFSET ?
  `, [userId, userId, perPage, skip]);

  //Mapper les tâches (ajouter les collaborateurs)
  const items = await Promise.all(
    tasks.map(async (task: any) => {
      const collaborators = await db.all(
        'SELECT userId FROM task_collaborators WHERE taskId = ?',
        [task.id]
      );

      return {
        id: task.id,
        name: task.name,
        description: task.description,
        is_done: Boolean(task.is_done),
        userId: task.userId,
        collaboratorId: collaborators.map((c: any) => c.userId)
      };
    })
  );
  return { items, total, page, perPage };
};


// Récupérer les tâches d'un utilisateur (pour compatibilité))
export const getUserTasks = async (userId: number): Promise <Task[]> => {
  const result = await findAllPaginated(userId, 1, 1000);
  return result.items;
};

// Créer une tâche
export const createTask = async (input: TaskCreateInput): Promise <Task> => {
  const { name, description, userId } = input;

  if (!name || !description) {
    throw new Error('Nom et description requis');
  }

  const db = getDb();

  const result = await db.run(
    'INSERT INTO tasks (name, description, is_done, userId) VALUES (?, ?, 0, ?)',
    [name, description, userId]
  );

  return {
    id: result.lastID!,
    name,
    description,
    is_done: false,
    userId,
    collaboratorId: []
  };
};

// Mettre à jour une tâche
export const updateTask = async (
  taskId: number,
  userId: number,
  input: TaskUpdateInput
): Promise <Task> => {
  const db = getDb();

  // Vérifier l'accès
  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
  if (!task) {
    throw new Error('Tâche non trouvée');
  }

  const isCollaborator = await db.get(
    'SELECT * FROM task_collaborators WHERE taskId = ? AND userId = ?',
    [taskId, userId]
  );

  if (task.userId !== userId && !isCollaborator) {
    throw new Error('Accès refusé : vous n\'avez pas les droits sur cette tâche');
  }

  // Mise à jour
  if (input.name) {
    await db.run('UPDATE tasks SET name = ? WHERE id = ?', [input.name, taskId]);
  }
  if (input.description) {
    await db.run('UPDATE tasks SET description = ? WHERE id = ?', [input.description, taskId]);
  }
  if (input.is_done !== undefined) {
    await db.run('UPDATE tasks SET is_done = ? WHERE id = ?', [input.is_done ? 1 : 0, taskId]);
  }

  const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
  const collaborators = await db.all('SELECT userId FROM task_collaborators WHERE taskId = ?', [taskId]);

  return {
    id: updatedTask.id,
    name: updatedTask.name,
    description: updatedTask.description,
    is_done: Boolean(updatedTask.is_done),
    userId: updatedTask.userId,
    collaboratorId: collaborators.map((c: any) => c.userId)
  };
};

// Supprimer une tâche
export const deleteTask = async (taskId: number, userId: number): Promise <void>=> {
  const db = getDb();

  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
  if (!task) {
    throw new Error('Tâche non trouvée');
  }

  if (task.userId !== userId) {
    throw new Error('Action refusée : seul le propriétaire peut supprimer cette tâche');
  }

  await db.run('DELETE FROM tasks WHERE id = ?', [taskId]);
};


// Ajouter un collaborateur
export const addCollaborator = async (
  taskId: number,
  ownerId: number,
  collaboratorId: number
): Promise <void>=> {
  const db = getDb();

  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
  if (!task) {
    throw new Error('Tâche non trouvée');
  }

  if (task.userId !== ownerId) {
    throw new Error('Action refusée : seul le propriétaire peut ajouter des collaborateurs');
  }

  if (task.userId === collaboratorId) {
    throw new Error('Le propriétaire ne peut pas être ajouté comme collaborateur');
  }

  const userExists = await db.get('SELECT * FROM users WHERE id = ?', [collaboratorId]);
  if (!userExists) {
    throw new Error('Utilisateur non trouvé');
  }

  const existing = await db.get(
    'SELECT * FROM task_collaborators WHERE taskId = ? AND userId = ?',
    [taskId, collaboratorId]
  );

  if (existing) {
    throw new Error('Cet utilisateur est déjà collaborateur');
  }

  await db.run(
    'INSERT INTO task_collaborators (taskId, userId) VALUES (?, ?)',
    [taskId, collaboratorId]
  );
};

// Retirer un collaborateur
export const removeCollaborator = async (
  taskId: number,
  ownerId: number,
  collaboratorId: number
): Promise <void>=> {
  const db = getDb();

  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
  if (!task) {
    throw new Error('Tâche non trouvée');
  }

  if (task.userId !== ownerId) {
    throw new Error('Action refusée : seul le propriétaire peut retirer des collaborateurs');
  }

  const existing = await db.get(
    'SELECT * FROM task_collaborators WHERE taskId = ? AND userId = ?',
    [taskId, collaboratorId]
  );

  if (!existing) {
    throw new Error('Collaborateur non trouvé sur cette tâche');
  }

  await db.run(
    'DELETE FROM task_collaborators WHERE taskId = ? AND userId = ?',
    [taskId, collaboratorId]
  );
};
