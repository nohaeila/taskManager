import express from "express";
import { tasks } from "./resources/tasks.js"; 
import { users } from "./resources/users.js"; 


const app = express();
app.use(express.json());

// GET
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// POST
app.post("/api/tasks", (req, res) => {
  const { name, description } = req.body;
  const newTask = {
    id: tasks.length + 1,
    name,
    description,
    is_done: false
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT
app.put("/api/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    res.status(404).json({ message: "Tâche non trouvée" });
    return;
  }

  if (req.body.name) task.name = req.body.name;
  if (req.body.description) task.description = req.body.description;
  if (req.body.is_done !== undefined) task.is_done = req.body.is_done;

  res.json(task);
});

// DELETE 
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

// GET
app.get("/api/users", (req, res) => {
  res.json(users);
});

//POST
app.post("/api/users", (req, res) => {
  const { name } = req.body;
  const newUser = {
    id: users.length + 1,
    name,
    is_login: false
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT
app.put("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(t => t.id === id);

  if (!user) {
    res.status(404).json({ message: "user non trouvée" });
    return;
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

// Serveur
app.listen(3000, () => console.log("Serveur REST lancé sur http://localhost:3000"));
