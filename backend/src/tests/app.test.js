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

describe('POST /users/login', () => {
    beforeEach(async () => {
        await User.create({
        username: 'testuser',
        password: 'testpassword',
        role: 'client',
        name: 'Test User'
        });
    });

    afterEach(async () => {
        await User.destroy({ where: { username: 'testuser' } });
    });

    it('should return a JWT token when valid credentials are provided', async () => {
        const response = await request(app)
        .post('/users/login')
        .send({
            username: 'testuser',
            password: 'testpassword'
        })
        .expect(200);
        
        expect(response.body.token).toBeDefined();
    });

    it('should return an error message when an invalid username is provided', async () => {
        const response = await request(app)
        .post('/users/login')
        .send({
            username: 'invalidusername',
            password: 'testpassword'
        })
        .expect(401);
        
        expect(response.body.message).toEqual('User not found');
    });

    it('should return an error message when an incorrect password is provided', async () => {
        const response = await request(app)
        .post('/users/login')
        .send({
            username: 'testuser',
            password: 'incorrectpassword'
        })
        .expect(401);
        
        expect(response.body.message).toEqual('Incorrect password');
    });
});