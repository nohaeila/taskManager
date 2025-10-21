import express from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from "./resources/users.js";

const router = express.Router();
const secretKey = process.env.JWT_SECRET || 'ma_cle_secrete';


router.post("/signup", async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).send('Nom et mot de passe requis');
    }

  // Vérifier si l'utilisateur existe
  const existingUser = users.find(u => u.name === name);
  if (existingUser) {
    return res.status(409).send('Utilisateur déjà existant');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 8);

  // Ajouter l'utilisateur
  users.push({ 
    id: users.length + 1, 
    name, 
    password: hashedPassword, 
    is_login: false
  });

  res.status(201).send('Utilisateur créé');
});



// Login route
router.post('/login', async (req, res) => {
  const { name, password } = req.body;

    if (!name || !password) {
    return res.status(400).send('Nom et mot de passe requis');
  }

  const user = users.find(u => u.name === name);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Identifiants invalides');
  }

  // Générer un token
  const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
  res.status(200).send({ token });
});


export default router;
