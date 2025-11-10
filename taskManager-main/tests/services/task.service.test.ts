import * as taskService from '../../src/services/task.service.js';
import { getDb } from '../../src/db/database.js';

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
    jest.clearAllMocks();
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
      mockDb.get.mockResolvedValueOnce({ id: 1, userId: 2 }); // Task owner is user 2
      mockDb.get.mockResolvedValueOnce(null); // Not a collaborator

      await expect(taskService.updateTask(1, 1, { name: 'Updated' }))
        .rejects.toThrow('Accès refusé');
    });

    it('should update task for owner', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, name: 'Old', userId: 1 });
      mockDb.get.mockResolvedValueOnce({ id: 1, name: 'New', description: 'Desc', is_done: 0, userId: 1 });
      mockDb.all.mockResolvedValue([]);
      mockDb.run.mockResolvedValue({});

      const result = await taskService.updateTask(1, 1, { name: 'New' });

      expect(result.name).toBe('New');
      expect(mockDb.run).toHaveBeenCalled();
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

    it('should throw if user is not owner', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, userId: 2 });

      await expect(taskService.addCollaborator(1, 1, 3))
        .rejects.toThrow('seul le propriétaire peut ajouter');
    });

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

    it('should add collaborator successfully', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, userId: 1 });
      mockDb.get.mockResolvedValueOnce({ id: 2, name: 'User2' });
      mockDb.get.mockResolvedValueOnce(null); // Not already a collaborator
      mockDb.run.mockResolvedValue({});

      await taskService.addCollaborator(1, 1, 2);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO task_collaborators (taskId, userId) VALUES (?, ?)',
        [1, 2]
      );
    });
  });
});