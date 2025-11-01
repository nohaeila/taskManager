import express from "express";
import { tasks } from "./resources/tasks.js"; 
import { users } from "./resources/users.js"; 
import dotenv from "dotenv";
import authRoutes from "./auth.js";
import taskRoutes, { authenticateToken } from './authMiddleware.js'; 
import { checkTaskOwner, checkTaskAccess } from './taskPermissions.js';
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use('/api', taskRoutes);

const swaggerDocument = YAML.load("./docs/swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// GET tasks (Voir mes tâches)
app.get("/api/tasks", authenticateToken, (req, res) => {
    const userId = req.user!.id;

    // Filtrer les tâches où l'utilisateur est propriétaire OU collaborateur
    const userTasks = tasks.filter(
        t => t.userId === userId || t.collaboratorId.includes(userId)
  );
  res.json(tasks);
});

// POST tasks (Créer une tâche)
app.post("/api/tasks", authenticateToken, (req, res) => {
  const { name, description } = req.body;

    if (!name || !description) {
    return res.status(400).send('Nom et description requis');
  }
  const newTask = {
    id: tasks.length + 1,
    name,
    description,
    is_done: false,
    userId: req.user!.id,
    collaboratorId: []
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT tasks ( Modifier une tâche )
app.put("/api/tasks/:id", authenticateToken, checkTaskAccess, (req, res) => {
  const idParam = req.params.id;
  
  if (!idParam) {
    return res.status(400).json({ error: "ID manquant" });
  }
  
  const id = parseInt(idParam);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: "Tâche non trouvée" });
  }

  if (req.body.name) task.name = req.body.name;
  if (req.body.description) task.description = req.body.description;
  if (req.body.is_done !== undefined) task.is_done = req.body.is_done;

  res.json(task);
});

// DELETE tasks (Supprimer une tâche )
app.delete("/api/tasks/:id", authenticateToken, checkTaskOwner, (req, res) => {
  const idParam = req.params.id;
  
  if (!idParam) {
    return res.status(400).json({ error: "ID manquant" });
  }
  
  const id = parseInt(idParam);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Tâche non trouvée" });
  }

  const deletedTask = tasks.splice(index, 1)[0];
  res.json({ message: 'Tâche supprimée', task: deletedTask });
});

//POST (Ajouter un collaborateur)
app.post("/api/tasks/:id/collaborators", authenticateToken, checkTaskOwner, (req, res) => {
  const idParam = req.params.id;
  
  if (!idParam) {
    return res.status(400).json({ error: "ID manquant" });
  }
  
  const taskId = parseInt(idParam);
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'ID utilisateur requis' });
  }

  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Tâche non trouvée' });
  }

  const userExists = users.find(u => u.id === userId);
  if (!userExists) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  if (task.collaboratorId.includes(userId)) {
    return res.status(400).json({ error: 'Cet utilisateur est déjà collaborateur' });
  }

  if (task.userId === userId) {
    return res.status(400).json({ error: 'Le propriétaire ne peut pas être ajouté comme collaborateur' });
  }

  task.collaboratorId.push(userId);
  
  res.status(200).json({ 
    message: 'Collaborateur ajouté',
    task 
  });
});

// DELETE (Retirer un collaborateur )
app.delete("/api/tasks/:id/collaborators/:userId", authenticateToken, checkTaskOwner, (req, res) => {
  const idParam = req.params.id;
  const userIdParam = req.params.userId;
  
  if (!idParam || !userIdParam) {
    return res.status(400).json({ error: "ID manquant" });
  }
  
  const taskId = parseInt(idParam);
  const collaboratorId = parseInt(userIdParam);

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Tâche non trouvée' });
  }

  const index = task.collaboratorId.indexOf(collaboratorId);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Collaborateur non trouvé sur cette tâche' });
  }

  task.collaboratorId.splice(index, 1);
  
  res.status(200).json({ 
    message: 'Collaborateur retiré',
    task 
  });
});

// GET (liste des users)
app.get("/api/users", (req, res) => {
  res.json(users);
});

//POST users
app.post("/api/users", (req, res) => {
  const { name } = req.body;
    if (!name) {
    return res.status(400).send('Nom requis');
  }
  const newUser = {
    id: users.length + 1,
    name,
    password:'',
    is_login: false,
    refreshToken: undefined
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT users
app.put("/api/users/:id", authenticateToken, (req, res) => {
  const idParam = req.params.id;
  
  if (!idParam) {
    return res.status(400).json({ error: "ID manquant" });
  }
  
  const id = parseInt(idParam);
  const userId = req.user!.id;

  if (id !== userId) {
    return res.status(403).json({ error: 'Vous ne pouvez modifier que votre propre profil' });
  }

  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  if (req.body.name) user.name = req.body.name;

  res.json({ id: user.id, name: user.name });
});

// DELETE 
app.delete("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(t => t.id === id);

  if (index === -1) {
    res.status(404).json({ message: "user non trouvée" });
    return;
  }

  const deletedUser = users.splice(index, 1)[0];
  res.json(deletedUser);
});

app.listen(PORT, () => {
  console.log(`Serveur REST lancé sur http://localhost:${PORT}`);
});