/// <reference types="jest" />
import request from 'supertest';
import express from 'express';
import authRoutes from '../auth.js';
import { users } from '../resources/users.js';
import bcrypt from 'bcryptjs';


// Mock de la base de données
jest.mock('../database.js', () => ({
  initializeDatabase: jest.fn().mockResolvedValue({
    run: jest.fn().mockResolvedValue({ lastID: 1 }),
    get: jest.fn(),
    exec: jest.fn()
  })
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Tests de la route /api/auth/signup', () => {
  beforeEach(() => {
    users.length = 0;
    users.push(
      { id: 1, name: "Jean", password: 'hashedpassword', is_login: false },
      { id: 2, name: "Bob", password: 'hashedpassword', is_login: false }
    );
  });

  test('Étape 1 : Créer un nouvel utilisateur avec succès', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Utilisateur créé avec succès');
    expect(response.body.user.name).toBe('Alice');
  });

  test('Étape 2 : Refuser si le nom est manquant', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Nom et mot de passe requis');
  });

  test('Étape 3 : Refuser si le mot de passe est manquant', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Nom et mot de passe requis');
  });

  test('Étape 4 : Refuser si l\'utilisateur existe déjà', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Jean', password: 'password123' });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Utilisateur déjà existant');
  });
});

describe('Tests de la route /api/auth/login', () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    users.length = 0;
    users.push({
      id: 1,
      name: 'TestUser',
      password: hashedPassword,
      is_login: false
    });
  });

  test('Étape 5 : Connexion réussie avec identifiants valides', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ name: 'TestUser', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Connexion réussie');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.name).toBe('TestUser');
  });

  test('Étape 6 : Refuser si le nom est manquant', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Nom et mot de passe requis');
  });

  test('Étape 7 : Refuser si l\'utilisateur n\'existe pas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ name: 'Inconnu', password: 'password123' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Identifiants invalides');
  });

  test('Étape 8 : Refuser si le mot de passe est incorrect', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ name: 'TestUser', password: 'wrong' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Identifiants invalides');
  });
});