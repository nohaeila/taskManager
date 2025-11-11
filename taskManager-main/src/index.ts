import express from 'express';
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', taskRoutes);

const swaggerDocument = YAML.load("./docs/swagger.yaml"); 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 

// Initialise la base de données et démarre le serveur
const startServer = async () => {
  try {
    await initDatabase();
    console.log('Base de données initialisée');

    app.listen(PORT, () => {
      console.log(`Serveur lancé sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage:', error);
    process.exit(1);
  }
};

startServer();