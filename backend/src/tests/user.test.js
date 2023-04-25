import request from 'supertest';
import { app } from '../app.js';
import { User } from '../models/user.js';


describe('POST /users/register', () => {
    beforeAll(async () => {
      await User.sync({ force: true });
    });
  
    afterEach(async () => {
      await User.destroy({ where: {} });
    });
  
    it('creates a new user and returns 201', async () => {
      const userData = {
        username: 'johndoe',
        password: 'password',
        name: 'John Doe',
      };
      const response = await request(app)
        .post('/users/register')
        .send(userData)
        .expect(201);
      expect(response.body.username).toBe(userData.username);
      expect(response.body.name).toBe(userData.name);
    });
  
    it('returns 403 if the username already exists', async () => {
      const userData = {
        username: 'johndoe',
        password: 'password',
        name: 'John Doe',
      };
      await User.create(userData);
      const response = await request(app)
        .post('/users/register')
        .send(userData)
        .expect(403);
      expect(response.body.message).toBe('Resource already exists');
    });
  
    it('returns 400 if the request data is invalid', async () => {
      const userData = {
        username: 'johndoe',
        password: 'password',
      };
      const response = await request(app)
        .post('/users/register')
        .send(userData)
        .expect(400);
      expect(response.body.message).toBe(
        'notNull Violation: User.name cannot be null'
      );
    });
  });

