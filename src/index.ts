import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import taskRoutes from './routes/task.route.js';
import swaggerUi from "swagger-ui-express";
import YAML from 'yamljs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS : Gestion des domaines autorisés
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
  })
);

const swaggerDocument = YAML.load("./docs/swagger.yaml"); 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', taskRoutes);

// Initialise la base de données et démarre le serveur
const startServer = async () => {
  try {
    await initDatabase();
    console.log('Base de données initialisée');

    app.listen(PORT, () => {
      console.log(`Serveur lancé sur http://localhost:${PORT}`);
      console.log(`Documentation Swagger : http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage:', error);
    process.exit(1);
  }
};

startServer();