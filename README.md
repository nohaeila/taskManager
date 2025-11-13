# Gestionnaire de Tâches (Task Manager)

## Description
Application de gestion de tâches avec système d'authentification JWT et collaboration.
Le projet utilise une API REST développée avec TypeScript & Express.js

## Fonctionnalités

Gestion des Tâches:
-Créer de nouvelles tâches avec nom et description
-Consulter la liste de toutes les tâches
-Modifier les informations d'une tâche
-Marquer une tâche comme terminée ou non terminée
-Supprimer des tâches

Gestion des utilisateurs : 
- Chaque utilisateur peut :  
  - Voir uniquement ses tâches  
  - Ajouter d’autres utilisateurs à ses tâches (collaboration)  
  - Mettre à jour ou supprimer ses propres tâches  

- Authentification JWT (Access Token + Refresh Token)  
- Validation de mot de passe sécurisé
- API REST pour toutes les opérations  

## Technologies utilisées
- Node.js + Express
- TypeScript
- SQLite (base de données)
- JWT (authentification)
- bcrypt (hashage des mots de passe)
- Jest (tests)

## Installation
Installer les dépendances:
npm install

## Démarrer le projet
npm run dev
npm start

Le serveur démarre sur : `http://localhost:3000`

## Documentation API
La documentation Swagger : `http://localhost:3000/api-docs`

## Tests
npm test

# Lancer les tests avec couverture
npm run test:coverage

## Structure du projet

project/
├── src/
│   ├── db/              # Configuration base de données
│   ├── models/          # Interfaces TypeScript, défini la structure des données
│   ├── utils/           # Fonctions utilitaires (JWT, password)
│   ├── middlewares/     # Middlewares Express
│   ├── services/        # Logique métier et persistance
│   ├── controllers/     # Gestion des requêtes/réponses
│   ├── routes/          # Définition des routes
│   └── index.ts         # Point d'entrée
├── tests/               # Tests unitaires
├── docs/                # Documentation Swagger
└── database.db          # Base SQLite (généré automatiquement)

## API Tierce utilisée

### Google Calendar API
- **Description :** Synchronisation automatique des tâches avec Google Calendar
- **Documentation :** https://developers.google.com/calendar/api
- **Utilisation :** Créer, récupérer et supprimer des événements dans le calendrier

**Cas d'usage :**
- Créer une tâche → Automatiquement ajoutée au calendrier Google
- Supprimer une tâche → Supprimer l'événement du calendrier
- Voir les dates importantes dans Google Calendar 

## Licence
Ce projet est sous licence MIT.