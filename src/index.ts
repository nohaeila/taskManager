import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import taskRoutes from './routes/task.route.js';
import swaggerUi from "swagger-ui-express";
import YAML from 'yamljs';
import cookieParser from 'cookie-parser';
import calendarRoutes from './routes/calendar.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

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
app.use('/api', calendarRoutes);


// Nettoyer les tokens expirés toutes les heures
setInterval(async () => {
  try {
    const { cleanExpiredTokens } = await import('./services/auth.service.js');
    await cleanExpiredTokens();
    console.log('Tokens expirés nettoyés');
  } catch (error) {
    console.error('Erreur nettoyage tokens:', error);
  }
}, 60 * 60 * 1000); // 1 heure

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