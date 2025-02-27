const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

describe('API Endpoints', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: await require('bcryptjs').hash('password123', 10),
    });
    userId = user._id;
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  // Auth Tests
  describe('Auth Routes', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: 'test2@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
    });

    it('should login an existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });
  });

  // Task Tests
  describe('Task Routes', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'This is a test task',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Test Task');
    });

    it('should get all tasks', async () => {
      await Task.create({ title: 'Test Task', user: userId });
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('should get paginated tasks', async () => {
      await Task.insertMany([
        { title: 'Task 1', user: userId },
        { title: 'Task 2', user: userId },
      ]);
      const res = await request(app)
        .get('/api/tasks/paginated?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.tasks.length).toBe(1);
      expect(res.body.totalPages).toBe(2);
    });

    it('should search tasks', async () => {
      await Task.create({ title: 'Test Task', description: 'Searchable', user: userId });
      const res = await request(app)
        .get('/api/tasks/search?q=test')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it('should filter tasks by completion', async () => {
      await Task.create([
        { title: 'Task 1', completed: true, user: userId },
        { title: 'Task 2', completed: false, user: userId },
      ]);
      const res = await request(app)
        .get('/api/tasks/filter?completed=true')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].completed).toBe(true);
    });
  });
});
