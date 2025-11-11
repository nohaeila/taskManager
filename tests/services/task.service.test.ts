import * as taskService from '../../src/services/task.service.js';
import { getDb } from '../../src/db/database.js';

// Mock de la base de données
jest.mock('../../src/db/database', () => ({
  getDb: jest.fn()
}));

const mockDb = {
  get: jest.fn(),
  run: jest.fn(),
  all: jest.fn()
};

describe('Task Service', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // on vide les mocks avant chaque test
    (getDb as jest.Mock).mockReturnValue(mockDb);
  });

  // Tests de création de tâche
  describe('createTask', () => {
    it('should throw if name or description is missing', async () => {
      await expect(taskService.createTask({ name: '', description: 'Desc', userId: 1 }))
        .rejects.toThrow('Nom et description requis');
      
      await expect(taskService.createTask({ name: 'Task', description: '', userId: 1 }))
        .rejects.toThrow('Nom et description requis');
    });

    it('should create task successfully', async () => {
      mockDb.run.mockResolvedValue({ lastID: 1 });

      const result = await taskService.createTask({
        name: 'New Task',
        description: 'Description',
        userId: 1
      });

      expect(result).toEqual({
        id: 1,
        name: 'New Task',
        description: 'Description',
        is_done: false,
        userId: 1,
        collaboratorId: []
      });
    });
  });

  // Tests de modification de tâche
  describe('updateTask', () => {
    it('should throw if task not found', async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(taskService.updateTask(1, 1, { name: 'Updated' }))
        .rejects.toThrow('Tâche non trouvée');
    });

    it('should throw if user has no access', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, userId: 2 }); // le propriétaire est user 2
      mockDb.get.mockResolvedValueOnce(null);  // pas collaborateur

      await expect(taskService.updateTask(1, 1, { name: 'Updated' }))
        .rejects.toThrow('Accès refusé');
    });
    //update la tache si c'est le propriétaire
    it('should update task for owner', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, name: 'Old', userId: 1 }); // vérifier l'accès
      mockDb.get.mockResolvedValueOnce(null);
      mockDb.run.mockResolvedValue({});

        // récupérer la tâche mise à jour
       mockDb.get.mockResolvedValueOnce({ 
        id: 1, 
        name: 'New', 
        description: 'Desc', 
        is_done: 0, 
        userId: 1 
      });

      mockDb.all.mockResolvedValue([]);

      const result = await taskService.updateTask(1, 1, { name: 'New' });

      expect(result.name).toBe('New');
      expect(mockDb.run).toHaveBeenCalled();
    });

    it('should update task for collaborator', async () => {
        // User 2 est collaborateur de la tâche 1 (owner: user 1)
        mockDb.get.mockResolvedValueOnce({ id: 1, name: 'Old', userId: 1 });
        mockDb.get.mockResolvedValueOnce({ taskId: 1, userId: 2 }); // Est collaborateur
        mockDb.run.mockResolvedValue({});
        mockDb.get.mockResolvedValueOnce({ 
            id: 1, 
            name: 'Updated', 
            description: 'Desc', 
            is_done: 0, 
            userId: 1 
        });
        mockDb.all.mockResolvedValue([{ userId: 2 }]);

        const result = await taskService.updateTask(1, 2, { name: 'Updated' });

        expect(result.name).toBe('Updated');
        });

        it('should update only description', async () => {
        mockDb.get.mockResolvedValueOnce({ id: 1, userId: 1 });
        mockDb.get.mockResolvedValueOnce(null);
        mockDb.run.mockResolvedValue({});
        mockDb.get.mockResolvedValueOnce({ 
            id: 1, 
            name: 'Old', 
            description: 'New Desc', 
            is_done: 0, 
            userId: 1 
        });
        mockDb.all.mockResolvedValue([]);

        const result = await taskService.updateTask(1, 1, { description: 'New Desc' });

        expect(result.description).toBe('New Desc');
        });

        it('should update only is_done', async () => {
        mockDb.get.mockResolvedValueOnce({ id: 1, userId: 1 });
        mockDb.get.mockResolvedValueOnce(null);
        mockDb.run.mockResolvedValue({});
        mockDb.get.mockResolvedValueOnce({ 
            id: 1, 
            name: 'Old', 
            description: 'Desc', 
            is_done: 1, 
            userId: 1 
        });
        mockDb.all.mockResolvedValue([]);

        const result = await taskService.updateTask(1, 1, { is_done: true });

        expect(result.is_done).toBe(true);
        });
    });

   // Tests de suppression de tâche
  describe('deleteTask', () => {
    it('should throw if task not found', async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(taskService.deleteTask(1, 1))
        .rejects.toThrow('Tâche non trouvée');
    });

    it('should throw if user is not owner', async () => {
      mockDb.get.mockResolvedValue({ id: 1, userId: 2 });

      await expect(taskService.deleteTask(1, 1))
        .rejects.toThrow('seul le propriétaire peut supprimer');
    });

    it('should delete task successfully', async () => {
      mockDb.get.mockResolvedValue({ id: 1, userId: 1 });
      mockDb.run.mockResolvedValue({});

      await taskService.deleteTask(1, 1);

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = ?', [1]);
    });
  });

    // Tests d'ajout de collaborateur
  describe('addCollaborator', () => {
    it('should throw if task not found', async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(taskService.addCollaborator(1, 1, 2))
        .rejects.toThrow('Tâche non trouvée');
    });
    //Erreur si l’utilisateur n’est pas propriétaire
    it('should throw if user is not owner', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, userId: 2 });

      await expect(taskService.addCollaborator(1, 1, 3))
        .rejects.toThrow('seul le propriétaire peut ajouter');
    });
    //erreur si le propriétaire essaie de s’ajouter
    it('should throw if owner tries to add themselves', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, userId: 1 });

      await expect(taskService.addCollaborator(1, 1, 1))
        .rejects.toThrow('propriétaire ne peut pas être ajouté');
    });

    it('should throw if user not found', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, userId: 1 });
      mockDb.get.mockResolvedValueOnce(null);

      await expect(taskService.addCollaborator(1, 1, 2))
        .rejects.toThrow('Utilisateur non trouvé');
    });

    it('should throw if user already collaborator', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, userId: 1 });
      mockDb.get.mockResolvedValueOnce({ id: 2, name: 'User2' });
      mockDb.get.mockResolvedValueOnce({ taskId: 1, userId: 2 }); // Deja collaborateur 

      await expect(taskService.addCollaborator(1, 1, 2))
        .rejects.toThrow('Cet utilisateur est déjà collaborateur');
    });

    it('should add collaborator successfully', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, userId: 1 });
      mockDb.get.mockResolvedValueOnce({ id: 2, name: 'User2' });
      mockDb.get.mockResolvedValueOnce(null); // Pas encore collaborateur 
      mockDb.run.mockResolvedValue({});

      await taskService.addCollaborator(1, 1, 2);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO task_collaborators (taskId, userId) VALUES (?, ?)',
        [1, 2]
      );
    });
  });
});

describe('getUserTasks', () => {
    it('should return user tasks with collaborators', async () => {
      const mockTasks = [
        { id: 1, name: 'Task1', description: 'Desc1', is_done: 0, userId: 1 },
        { id: 2, name: 'Task2', description: 'Desc2', is_done: 1, userId: 1 }
      ];
      
      mockDb.all.mockResolvedValueOnce(mockTasks);
      mockDb.all.mockResolvedValueOnce([{ userId: 2 }]); // Collaborateurs pour task 1
      mockDb.all.mockResolvedValueOnce([]); // Pas de collaborateurs pour task 2

      const result = await taskService.getUserTasks(1);

      expect(result).toHaveLength(2);
      expect(result[0].collaboratorId).toEqual([2]);
      expect(result[1].collaboratorId).toEqual([]);
    });
  });

  //Tests pour retirer un collaborateur
  describe('removeCollaborator', () => {
    it('should throw if task not found', async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(taskService.removeCollaborator(1, 1, 2))
        .rejects.toThrow('Tâche non trouvée');
    });

    it('should throw if user is not owner', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, userId: 2 });

      await expect(taskService.removeCollaborator(1, 1, 2))
        .rejects.toThrow('seul le propriétaire peut retirer');
    });

    it('should throw if collaborator not found', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, userId: 1 });
      mockDb.get.mockResolvedValueOnce(null);

      await expect(taskService.removeCollaborator(1, 1, 2))
        .rejects.toThrow('Collaborateur non trouvé');
    });

    it('should remove collaborator successfully', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, userId: 1 });
      mockDb.get.mockResolvedValueOnce({ taskId: 1, userId: 2 });
      mockDb.run.mockResolvedValue({});

      await taskService.removeCollaborator(1, 1, 2);

      expect(mockDb.run).toHaveBeenCalledWith(
        'DELETE FROM task_collaborators WHERE taskId = ? AND userId = ?',
        [1, 2]
      );
    });
  });

