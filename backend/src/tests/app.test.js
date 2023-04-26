import request from 'supertest';
import { app } from '../app.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { Achievement } from '../models/achievement.js';
import { Ability } from '../models/ability.js';


// User

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


// Achievement

describe('POST /achievements', () => {
  let validToken;
  let invalidToken;
  let unauthorizedToken;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'admin',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    invalidToken = 'sdfsdf';
    unauthorizedToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'client',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    await Achievement.sync({ force: true });
  });

  afterEach(async () => {
    await Achievement.destroy({ where: {} });
  });

  it('creates a new achievement and returns 201', async () => {
    const achievementData = {
      name: 'Test Achievement',
      points: 100,
      requirements: 'Test Requirements',
    };
    const response = await request(app)
      .post('/achievements')
      .send(achievementData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(201);
    expect(response.body.name).toBe(achievementData.name);
    expect(response.body.points).toBe(achievementData.points);
  });

  it('returns 403 if the name already exists', async () => {
    const achievementData = {
      name: 'Test Achievement',
      points: 100,
      requirements: 'Test Requirements',
    };
    await Achievement.create(achievementData);
    const response = await request(app)
      .post('/achievements')
      .send(achievementData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(403);
    expect(response.body.message).toBe('Resource already exists');
  });

  it('returns 400 if the request data is invalid', async () => {
    const achievementData = {
      points: 100,
      requirements: 'Test Requirements',
    };
    const response = await request(app)
      .post('/achievements')
      .send(achievementData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(
      'notNull Violation: Achievement.name cannot be null'
    );
  });

  it('returns 401 if the token is invalid', async () => {
    const achievementData = {
      name: 'Test Achievement',
      points: 100,
      requirements: 'Test Requirements',
    };
    const response = await request(app)
      .post('/achievements')
      .send(achievementData)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Token is not valid'
    );
  });

  it("returns 401 if the user doesn't have the necessary role", async () => {
    const achievementData = {
      name: 'Test Achievement',
      points: 100,
      requirements: 'Test Requirements',
    };
    const response = await request(app)
      .post('/achievements')
      .send(achievementData)
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Not authorized'
    );
  });
});

describe('PUT /achievements', () => {
  let validToken;
  let achievementId;
  let inexistentAchievementId;
  let invalidAchievementId;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'admin',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    inexistentAchievementId = "b5507584-d80c-4013-a351-c088f70b30fb";
    invalidAchievementId = "sdfsd";
    await Achievement.sync({ force: true });
  });

  beforeEach(async () => {
      const achievement = await Achievement.create({
        name: 'Test Achievement',
        points: 100,
        requirements: 'Test Requirements',
      });
      
      achievementId = achievement.dataValues.achievementId;
  });

  afterEach(async () => {
    await Achievement.destroy({ where: {} });
  });

  it('updates old achievement and returns 200', async () => {
    const newAchievementData = {
      name: 'Updated Achievement',
      points: 100,
      requirements: 'Test Requirements',
    };

    const response = await request(app)
      .put(`/achievements/${achievementId}`)
      .send(newAchievementData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    expect(response.body.name).toBe(newAchievementData.name);
    expect(response.body.points).toBe(newAchievementData.points);
  });

  it('returns 404 if the there is no achievement with the specified id', async () => {
    const newAchievementData = {
      name: 'Updated Achievement',
      points: 100,
      requirements: 'Test Requirements',
    };
    const response = await request(app)
      .put(`/achievements/${inexistentAchievementId}`)
      .send(newAchievementData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
    expect(response.body.error).toBe('Record not found');
  });

  it('returns 400 if the id is invalid', async () => {
    const newAchievementData = {
      name: 'Updated Achievement',
      points: 100,
      requirements: 'Test Requirements',
    };
    const response = await request(app)
      .put(`/achievements/${invalidAchievementId}`)
      .send(newAchievementData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input syntax for type uuid: \"${invalidAchievementId}\"`);
  });

  it('returns 403 if the name already exists', async () => {
    const newAchievementData = {
      name: 'Test Unique Achievement',
      points: 100,
      requirements: 'Test Requirements',
    };
    await Achievement.create({
      name: 'Test Unique Achievement',
      points: 100,
      requirements: 'Test Requirements',
    });
    const response = await request(app)
      .put(`/achievements/${achievementId}`)
      .send(newAchievementData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(403);
    expect(response.body.message).toBe('Resource already exists');
  });
});

describe('DELETE /achievements', () => {
  let validToken;
  let achievementId;
  let inexistentAchievementId;
  let invalidAchievementId;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'admin',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    inexistentAchievementId = "b5507584-d80c-4013-a351-c088f70b30fb";
    invalidAchievementId = "sdfsd";
    await Achievement.sync({ force: true });
  });

  beforeEach(async () => {
      const achievement = await Achievement.create({
        name: 'Test Achievement',
        points: 100,
        requirements: 'Test Requirements',
      });
      
      achievementId = achievement.dataValues.achievementId;
  });

  afterEach(async () => {
    await Achievement.destroy({ where: {} });
  });

  it('deletes achievement and returns 200', async () => {
    const response = await request(app)
      .delete(`/achievements/${achievementId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    expect(response.body.message).toBe('Record deleted');
  });

  it('returns 404 if the there is no achievement with the specified id', async () => {
    const response = await request(app)
      .delete(`/achievements/${inexistentAchievementId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
    expect(response.body.error).toBe('Record not found');
  });

  it('returns 400 if the id is invalid', async () => {
    const response = await request(app)
      .delete(`/achievements/${invalidAchievementId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input syntax for type uuid: \"${invalidAchievementId}\"`);
  });
});


// Ability
describe('POST /abilities', () => {
  let validToken;
  let invalidToken;
  let unauthorizedToken;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'admin',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    invalidToken = 'sdfsdf';
    unauthorizedToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'client',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    await Ability.sync({ force: true });
  });

  afterEach(async () => {
    await Ability.destroy({ where: {} });
  });

  it('creates a new ability and returns 201', async () => {
    const abilityData = {
      name: 'Test Ability',
      levelRequirement: 10,
      scalesWith: 'intellect',
      effect: 'Test Effect'
    };
    const response = await request(app)
      .post('/abilities')
      .send(abilityData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(201);
    expect(response.body.name).toBe(abilityData.name);
    expect(response.body.points).toBe(abilityData.points);
  });

  it('returns 403 if the name already exists', async () => {
    const abilityData = {
      name: 'Test Ability',
      levelRequirement: 10,
      scalesWith: 'intellect',
      effect: 'Test Effect'
    };
    await Ability.create(abilityData);
    const response = await request(app)
      .post('/abilities')
      .send(abilityData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(403);
    expect(response.body.message).toBe('Resource already exists');
  });

  it('returns 400 if the request data is invalid', async () => {
    const abilityData = {
      levelRequirement: 10,
      scalesWith: 'intellect',
      effect: 'Test Effect'
    };
    const response = await request(app)
      .post('/abilities')
      .send(abilityData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(
      'notNull Violation: Ability.name cannot be null'
    );
  });

  it('returns 400 if the scalesWith column is invalid', async () => {
    const abilityData = {
      name: 'Test Ability',
      levelRequirement: 10,
      scalesWith: 'dexterity',
      effect: 'Test Effect'
    };
    const response = await request(app)
      .post(`/abilities`)
      .send(abilityData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input value for enum enum_abilities_scales_with: \"${abilityData.scalesWith}\"`);
  });

  it('returns 401 if the token is invalid', async () => {
    const abilityData = {
      name: 'Test Ability',
      levelRequirement: 10,
      scalesWith: 'intellect',
      effect: 'Test Effect'
    };
    const response = await request(app)
      .post('/abilities')
      .send(abilityData)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Token is not valid'
    );
  });

  it("returns 401 if the user doesn't have the necessary role", async () => {
    const abilityData = {
      name: 'Test Ability',
      levelRequirement: 10,
      scalesWith: 'intellect',
      effect: 'Test Effect'
    };
    const response = await request(app)
      .post('/abilities')
      .send(abilityData)
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Not authorized'
    );
  });
});

describe('PUT /abilities', () => {
  let validToken;
  let abilityId;
  let inexistentAbilityId;
  let invalidAbilityId;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'admin',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    inexistentAbilityId = "b5507584-d80c-4013-a351-c088f70b30fb";
    invalidAbilityId = "sdfsd";
    await Ability.sync({ force: true });
  });

  beforeEach(async () => {
      const ability = await Ability.create({
        name: 'Test Ability',
        levelRequirement: 10,
        scalesWith: 'intellect',
        effect: 'Test Effect'
      });
      
      abilityId = ability.dataValues.abilityId;
  });

  afterEach(async () => {
    await Ability.destroy({ where: {} });
  });

  it('updates old ability and returns 200', async () => {
    const newAbilityData = {
      name: 'Updated Ability',
      levelRequirement: 10,
      scalesWith: 'intellect',
      effect: 'Test Effect'
    };

    const response = await request(app)
      .put(`/abilities/${abilityId}`)
      .send(newAbilityData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    expect(response.body.name).toBe(newAbilityData.name);
    expect(response.body.points).toBe(newAbilityData.points);
  });

  it('returns 404 if the there is no ability with the specified id', async () => {
    const newAbilityData = {
      name: 'Updated Ability',
      levelRequirement: 10,
      scalesWith: 'intellect',
      effect: 'Test Effect'
    };
    const response = await request(app)
      .put(`/abilities/${inexistentAbilityId}`)
      .send(newAbilityData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
    expect(response.body.error).toBe('Record not found');
  });

  it('returns 400 if the id is invalid', async () => {
    const newAbilityData = {
      name: 'Updated Ability',
      levelRequirement: 10,
      scalesWith: 'intellect',
      effect: 'Test Effect'
    };
    const response = await request(app)
      .put(`/abilities/${invalidAbilityId}`)
      .send(newAbilityData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input syntax for type uuid: \"${invalidAbilityId}\"`);
  });

  it('returns 403 if the name already exists', async () => {
    const newAbilityData = {
      name: 'Test Unique Ability',
      levelRequirement: 10,
      scalesWith: 'intellect',
      effect: 'Test Effect'
    };
    await Ability.create({
      name: 'Test Unique Ability',
      points: 100,
      requirements: 'Test Requirements',
    });
    const response = await request(app)
      .put(`/abilities/${abilityId}`)
      .send(newAbilityData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(403);
    expect(response.body.message).toBe('Resource already exists');
  });
});

describe('DELETE /abilities', () => {
  let validToken;
  let abilityId;
  let inexistentAbilityId;
  let invalidAbilityId;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'admin',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    inexistentAbilityId = "b5507584-d80c-4013-a351-c088f70b30fb";
    invalidAbilityId = "sdfsd";
    await Ability.sync({ force: true });
  });

  beforeEach(async () => {
      const ability = await Ability.create({
        name: 'Test Ability',
        levelRequirement: 10,
        scalesWith: 'intellect',
        effect: 'Test Effect'
      });
      
      abilityId = ability.dataValues.abilityId;
  });

  afterEach(async () => {
    await Ability.destroy({ where: {} });
  });

  it('deletes ability and returns 200', async () => {
    const response = await request(app)
      .delete(`/abilities/${abilityId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    expect(response.body.message).toBe('Record deleted');
  });

  it('returns 404 if the there is no ability with the specified id', async () => {
    const response = await request(app)
      .delete(`/abilities/${inexistentAbilityId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
    expect(response.body.error).toBe('Record not found');
  });

  it('returns 400 if the id is invalid', async () => {
    const response = await request(app)
      .delete(`/abilities/${invalidAbilityId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input syntax for type uuid: \"${invalidAbilityId}\"`);
  });
});