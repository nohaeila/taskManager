import express from "express";
import { tasks } from "./resources/tasks.js"; 
import { users } from "./resources/users.js"; 
import dotenv from "dotenv";
import authRoutes from "./auth.js";
import taskRoutes from './authMiddleware.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use('/api', taskRoutes);


// GET tasks
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// POST tasks
app.post("/api/tasks", (req, res) => {
  const { name, description } = req.body;
    if (!name || !description) {
    return res.status(400).send('Nom et description requis');
  }
  const newTask = {
    id: tasks.length + 1,
    name,
    description,
    is_done: false,
    userId: 1,
    collaboratorId: []
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT tasks
app.put("/api/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ message: "Tâche non trouvée" });
  }

  if (req.body.name) task.name = req.body.name;
  if (req.body.description) task.description = req.body.description;
  if (req.body.is_done !== undefined) task.is_done = req.body.is_done;
  if (req.body.collaboratorId) task.collaboratorId = req.body.collaboratorId; // Placeholder pour collaborateurs

  res.json(task);
});

// DELETE tasks
app.delete("/api/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    res.status(404).json({ message: "Tâche non trouvée" });
    return;
  }

  const deletedTask = tasks.splice(index, 1)[0];
  res.json(deletedTask);
});

// GET users
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
    is_login: false
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT users
app.put("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "user non trouvée" });
    
  }

  if (req.body.name) user.name = req.body.name;
  if (req.body.is_login !== undefined) user.is_login = req.body.is_login;

  res.json(user);
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