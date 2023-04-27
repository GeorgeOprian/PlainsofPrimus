import request from 'supertest';
import { app } from '../app.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { Achievement } from '../models/achievement.js';
import { Ability } from '../models/ability.js';
import { Armor } from '../models/armor.js';
import { Weapon } from '../models/weapon.js';
import { Character } from '../models/character.js';
import { CharacterAchievement } from '../models/characterAchievement.js';
import { CharacterAbility } from '../models/characterAbility.js';
import { SequelizeService } from '../config/db.js';

let sequelize = SequelizeService.getInstance();
jest.setTimeout(20000);

// User

describe('POST /users/register', () => {
  beforeAll(async () => {
    await User.sync({ force: true });
  });

  afterEach(async () => {
    await User.destroy({ where: {} });
    await Character.destroy({ where: { } });
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
        await Character.destroy({ where: { } });
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
        .expect(404);
        
        expect(response.body.message).toEqual('User not found');
    });

    it('should return an error message when an incorrect password is provided', async () => {
        const response = await request(app)
        .post('/users/login')
        .send({
            username: 'testuser',
            password: 'incorrectpassword'
        })
        .expect(403);
        
        expect(response.body.message).toEqual('Incorrect password');
    });
});


// Achievement

describe('GET /achievements', () => {
  beforeAll(async () => {
    await Achievement.sync({ force: true });
    await Achievement.create({
      name: 'Test Achievement 1',
      points: 50,
      requirements: 'Complete Test 1',
    });
    await Achievement.create({
      name: 'Test Achievement 2',
      points: 20,
      requirements: 'Complete Test 2',
    });
  });

  afterAll(async () => {
    await Achievement.destroy({ where: {} });
  });

  it('should return all achievements', async () => {
    const response = await request(app).get('/achievements');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('Test Achievement 1');
    expect(response.body[0].points).toBe(50);
    expect(response.body[0].requirements).toBe('Complete Test 1');
    expect(response.body[1].name).toBe('Test Achievement 2');
    expect(response.body[1].points).toBe(20);
    expect(response.body[1].requirements).toBe('Complete Test 2');
  });
});

describe('GET /achievements/:id', () => {
  let achievementId;
  beforeAll(async () => {
    await Achievement.sync({ force: true });
    let achievement = await Achievement.create({
      name: 'Test Achievement 1',
      points: 50,
      requirements: 'Complete Test 1',
    });
    achievementId = achievement.dataValues.achievementId;

    await Achievement.create({
      name: 'Test Achievement 2',
      points: 20,
      requirements: 'Complete Test 2',
    });
  });

  afterAll(async () => {
    await Achievement.destroy({ where: {} });
  });

  it('should return one achievement', async () => {
    const response = await request(app).get(`/achievements/${achievementId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Test Achievement 1');
    expect(response.body[0].points).toBe(50);
    expect(response.body[0].requirements).toBe('Complete Test 1');
  });
});

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

describe('GET /abilities', () => {
  beforeAll(async () => {
    await Ability.sync({ force: true });
    await Ability.create({
      name: 'Test Ability 1',
      levelRequirement: 10,
      scalesWith: "intellect"
    });
    await Ability.create({
      name: 'Test Ability 2',
      levelRequirement: 20,
      scalesWith: "strength"
    });
  });

  afterAll(async () => {
    await Ability.destroy({ where: {} });
  });

  it('should return all abilities', async () => {
    const response = await request(app).get('/abilities');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('Test Ability 1');
    expect(response.body[0].levelRequirement).toBe(10);
    expect(response.body[0].scalesWith).toBe('intellect');
    expect(response.body[1].name).toBe('Test Ability 2');
    expect(response.body[1].levelRequirement).toBe(20);
    expect(response.body[1].scalesWith).toBe('strength');
  });
});

describe('GET /abilities/:id', () => {
  let abilityId;
  beforeAll(async () => {
    await Ability.sync({ force: true });
    let ability = await Ability.create({
      name: 'Test Ability 1',
      levelRequirement: 10,
      scalesWith: "intellect"
    });
    abilityId = ability.dataValues.abilityId;

    await Ability.create({
      name: 'Test Ability 2',
      levelRequirement: 20,
      scalesWith: "strength"
    });
  });

  afterAll(async () => {
    await Ability.destroy({ where: {} });
  });

  it('should return one ability', async () => {
    const response = await request(app).get(`/abilities/${abilityId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Test Ability 1');
    expect(response.body[0].levelRequirement).toBe(10);
    expect(response.body[0].scalesWith).toBe('intellect');
  });
});

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

  it('returns 400 if the scalesWith column is not in enum', async () => {
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


// Armors

describe('GET /armors', () => {
  beforeAll(async () => {
    await Armor.sync({ force: true });
    await Armor.create({
      name: 'Test Armor 1',
      type: "chestplate",
      armor: 10,
    });
    await Armor.create({
      name: 'Test Armor 2',
      type: "leggings",
      armor: 20,
    });
  });

  afterAll(async () => {
    await Armor.destroy({ where: {} });
  });

  it('should return all armors', async () => {
    const response = await request(app).get('/armors');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('Test Armor 1');
    expect(response.body[0].type).toBe('chestplate');
    expect(response.body[0].armor).toBe(10);
    expect(response.body[1].name).toBe('Test Armor 2');
    expect(response.body[1].type).toBe('leggings');
    expect(response.body[1].armor).toBe(20);
  });
});

describe('GET /armors/:id', () => {
  let armorId;
  beforeAll(async () => {
    await Armor.sync({ force: true });
    let armor = await Armor.create({
      name: 'Test Armor 1',
      type: "chestplate",
      armor: 10,
    });
    armorId = armor.dataValues.armorId;

    await Armor.create({
      name: 'Test Armor 2',
      type: "leggings",
      armor: 20,
    });
  });

  afterAll(async () => {
    await Armor.destroy({ where: {} });
  });

  it('should return one armor', async () => {
    const response = await request(app).get(`/armors/${armorId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Test Armor 1');
    expect(response.body[0].type).toBe('chestplate');
    expect(response.body[0].armor).toBe(10);
  });
});

describe('POST /armors', () => {
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
    await Armor.sync({ force: true });
  });

  afterEach(async () => {
    await Armor.destroy({ where: {} });
  });

  it('creates a new armor and returns 201', async () => {
    const armorData = {
      name: 'Test Armor',
      image: "image",
      type: "chestplate",
      armor: 10,
      health: 10,
      intellect: 10
    };
    const response = await request(app)
      .post('/armors')
      .send(armorData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(201);
    expect(response.body.name).toBe(armorData.name);
    expect(response.body.type).toBe(armorData.type);
    expect(response.body.armor).toBe(armorData.armor);
  });

  it('returns 403 if the name already exists', async () => {
    const armorData = {
      name: 'Test Armor',
      image: "image",
      type: "chestplate",
      armor: 10,
      health: 10,
      intellect: 10
    };
    await Armor.create(armorData);
    const response = await request(app)
      .post('/armors')
      .send(armorData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(403);
    expect(response.body.message).toBe('Resource already exists');
  });

  it('returns 400 if the request data is invalid', async () => {
    const armorData = {
      image: "image",
      type: "chestplate",
      armor: 10,
      health: 10,
      intellect: 10
    };
    const response = await request(app)
      .post('/armors')
      .send(armorData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(
      'notNull Violation: Armor.name cannot be null'
    );
  });

  it('returns 400 if the intellect column is bigger than the maximum value', async () => {
    const armorData = {
      name: 'Test Armor',
      image: "image",
      type: "chestplate",
      armor: 10,
      health: 10,
      intellect: 1000
    };
    const response = await request(app)
      .post(`/armors`)
      .send(armorData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe('Validation error: Validation max on intellect failed');
  });

  it('returns 401 if the token is invalid', async () => {
    const armorData = {
      name: 'Test Armor',
      image: "image",
      type: "chestplate",
      armor: 10,
      health: 10,
      intellect: 10
    };
    const response = await request(app)
      .post('/armors')
      .send(armorData)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Token is not valid'
    );
  });

  it("returns 401 if the user doesn't have the necessary role", async () => {
    const armorData = {
      name: 'Test Armor',
      image: "image",
      type: "chestplate",
      armor: 10,
      health: 10,
      intellect: 10
    };
    const response = await request(app)
      .post('/armors')
      .send(armorData)
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Not authorized'
    );
  });
});

describe('PUT /armors', () => {
  let validToken;
  let armorId;
  let inexistentArmorId;
  let invalidArmorId;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'admin',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    inexistentArmorId = "b5507584-d80c-4013-a351-c088f70b30fb";
    invalidArmorId = "sdfsd";
    await Armor.sync({ force: true });
  });

  beforeEach(async () => {
      const armor = await Armor.create({
        name: 'Test Armor',
        image: "image",
        type: "chestplate",
        armor: 10,
        health: 10,
        intellect: 10
      });
      
      armorId = armor.dataValues.armorId;
  });

  afterEach(async () => {
    await Armor.destroy({ where: {} });
  });

  it('updates old armor and returns 200', async () => {
    const newArmorData = {
      name: 'Updated Armor',
      image: "image",
      type: "leggings",
      armor: 30,
      health: 10,
      intellect: 10
    };

    const response = await request(app)
      .put(`/armors/${armorId}`)
      .send(newArmorData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    expect(response.body.name).toBe(newArmorData.name);
    expect(response.body.type).toBe(newArmorData.type);
    expect(response.body.armor).toBe(newArmorData.armor);
  });

  it('returns 404 if the there is no armor with the specified id', async () => {
    const newArmorData = {
      name: 'Updated Armor',
        type: "chestplate",
        armor: 10,
        health: 10,
        intellect: 10
    };
    const response = await request(app)
      .put(`/armors/${inexistentArmorId}`)
      .send(newArmorData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
    expect(response.body.error).toBe('Record not found');
  });

  it('returns 400 if the id is invalid', async () => {
    const newArmorData = {
      name: 'Updated Armor',
      type: "chestplate",
      armor: 10,
      health: 10,
      intellect: 10
    };
    const response = await request(app)
      .put(`/armors/${invalidArmorId}`)
      .send(newArmorData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input syntax for type uuid: \"${invalidArmorId}\"`);
  });

  it('returns 403 if the name already exists', async () => {
    const newArmorData = {
      name: 'Test Unique Armor',
      type: "chestplate",
      armor: 10,
      health: 10,
      intellect: 10
    };
    await Armor.create({
      name: 'Test Unique Armor',
      type: "chestplate",
      armor: 10,
      health: 10,
      intellect: 10
    });
    const response = await request(app)
      .put(`/armors/${armorId}`)
      .send(newArmorData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(403);
    expect(response.body.message).toBe('Resource already exists');
  });
});

describe('DELETE /armors', () => {
  let validToken;
  let armorId;
  let inexistentArmorId;
  let invalidArmorId;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'admin',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    inexistentArmorId = "b5507584-d80c-4013-a351-c088f70b30fb";
    invalidArmorId = "sdfsd";
    await Armor.sync({ force: true });
  });

  beforeEach(async () => {
      const armor = await Armor.create({
        name: 'Test Armor',
        type: "chestplate",
        armor: 10,
        health: 10,
        intellect: 10
      });
      
      armorId = armor.dataValues.armorId;
  });

  afterEach(async () => {
    await Armor.destroy({ where: {} });
  });

  it('deletes armor and returns 200', async () => {
    const response = await request(app)
      .delete(`/armors/${armorId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    expect(response.body.message).toBe('Record deleted');
  });

  it('returns 404 if the there is no armor with the specified id', async () => {
    const response = await request(app)
      .delete(`/armors/${inexistentArmorId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
    expect(response.body.error).toBe('Record not found');
  });

  it('returns 400 if the id is invalid', async () => {
    const response = await request(app)
      .delete(`/armors/${invalidArmorId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input syntax for type uuid: \"${invalidArmorId}\"`);
  });
});


// Weapons

describe('GET /weapons', () => {
  beforeAll(async () => {
    await Weapon.sync({ force: true });
    await Weapon.create({
      name: 'Test Weapon 1',
      attackDamage: 20,
      specialBonus: "Test bonus 1"
    });
    await Weapon.create({
      name: 'Test Weapon 2',
      attackDamage: 30,
      specialBonus: "Test bonus 2"
    });
  });

  afterAll(async () => {
    await Weapon.destroy({ where: {} });
  });

  it('should return all weapons', async () => {
    const response = await request(app).get('/weapons');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('Test Weapon 1');
    expect(response.body[0].attackDamage).toBe(20);
    expect(response.body[0].specialBonus).toBe('Test bonus 1');
    expect(response.body[1].name).toBe('Test Weapon 2');
    expect(response.body[1].attackDamage).toBe(30);
    expect(response.body[1].specialBonus).toBe('Test bonus 2');
  });
});

describe('GET /weapons/:id', () => {
  let weaponId;
  beforeAll(async () => {
    await Weapon.sync({ force: true });
    let weapon = await Weapon.create({
      name: 'Test Weapon 1',
      attackDamage: 20,
      specialBonus: "Test bonus 1"
    });
    weaponId = weapon.dataValues.weaponId;

    await Weapon.create({
      name: 'Test Weapon 2',
      attackDamage: 30,
      specialBonus: "Test bonus 2"
    });
  });

  afterAll(async () => {
    await Weapon.destroy({ where: {} });
  });

  it('should return one weapon', async () => {
    const response = await request(app).get(`/weapons/${weaponId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Test Weapon 1');
    expect(response.body[0].attackDamage).toBe(20);
    expect(response.body[0].specialBonus).toBe('Test bonus 1');
  });
});

describe('POST /weapons', () => {
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
    await Weapon.sync({ force: true });
  });

  afterEach(async () => {
    await Weapon.destroy({ where: {} });
  });

  it('creates a new weapon and returns 201', async () => {
    const weaponData = {
      name: 'Test Weapon',
      image: "image",
      attackDamage: 20,
      specialBonus: "Cleave"
    };
    const response = await request(app)
      .post('/weapons')
      .send(weaponData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(201);
    expect(response.body.name).toBe(weaponData.name);
    expect(response.body.attackDamage).toBe(weaponData.attackDamage);
  });

  it('returns 403 if the name already exists', async () => {
    const weaponData = {
      name: 'Test Weapon',
      image: "image",
      attackDamage: 20,
      specialBonus: "Cleave"
    };
    await Weapon.create(weaponData);
    const response = await request(app)
      .post('/weapons')
      .send(weaponData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(403);
    expect(response.body.message).toBe('Resource already exists');
  });

  it('returns 400 if the request data is invalid', async () => {
    const weaponData = {
      image: "image",
      attackDamage: 20,
      specialBonus: "Cleave"
    };
    const response = await request(app)
      .post('/weapons')
      .send(weaponData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(
      'notNull Violation: Weapon.name cannot be null'
    );
  });

  it('returns 400 if the intellect column is bigger than the maximum value', async () => {
    const weaponData = {
      name: 'Test Weapon',
      image: "image",
      attackDamage: "test",
      specialBonus: "Cleave"
    };
    const response = await request(app)
      .post(`/weapons`)
      .send(weaponData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input syntax for type integer: \"${weaponData.attackDamage}\"`);
  });

  it('returns 401 if the token is invalid', async () => {
    const weaponData = {
      name: 'Test Weapon',
      image: "image",
      attackDamage: 20,
      specialBonus: "Cleave"
    };
    const response = await request(app)
      .post('/weapons')
      .send(weaponData)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Token is not valid'
    );
  });

  it("returns 401 if the user doesn't have the necessary role", async () => {
    const weaponData = {
      name: 'Test Weapon',
      image: "image",
      attackDamage: 20,
      specialBonus: "Cleave"
    };
    const response = await request(app)
      .post('/weapons')
      .send(weaponData)
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Not authorized'
    );
  });
});

describe('PUT /weapons', () => {
  let validToken;
  let weaponId;
  let inexistentWeaponId;
  let invalidWeaponId;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'admin',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    inexistentWeaponId = "b5507584-d80c-4013-a351-c088f70b30fb";
    invalidWeaponId = "sdfsd";
    await Weapon.sync({ force: true });
  });

  beforeEach(async () => {
      const weapon = await Weapon.create({
        name: 'Test Weapon',
        image: "image",
        attackDamage: 20,
        specialBonus: "Cleave"
      });
      
      weaponId = weapon.dataValues.weaponId;
  });

  afterEach(async () => {
    await Weapon.destroy({ where: {} });
  });

  it('updates old weapon and returns 200', async () => {
    const newWeaponData = {
      name: 'Updated Weapon',
      image: "image",
      attackDamage: 30,
      specialBonus: "Cleave"
    };

    const response = await request(app)
      .put(`/weapons/${weaponId}`)
      .send(newWeaponData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    expect(response.body.name).toBe(newWeaponData.name);
    expect(response.body.attackDamage).toBe(newWeaponData.attackDamage);
  });

  it('returns 404 if the there is no weapon with the specified id', async () => {
    const newWeaponData = {
      name: 'Updated Weapon',
      attackDamage: 20,
      specialBonus: "Cleave"
    };
    const response = await request(app)
      .put(`/weapons/${inexistentWeaponId}`)
      .send(newWeaponData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
    expect(response.body.error).toBe('Record not found');
  });

  it('returns 400 if the id is invalid', async () => {
    const newWeaponData = {
      name: 'Updated Weapon',
      attackDamage: 20,
      specialBonus: "Cleave"
    };
    const response = await request(app)
      .put(`/weapons/${invalidWeaponId}`)
      .send(newWeaponData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input syntax for type uuid: \"${invalidWeaponId}\"`);
  });

  it('returns 403 if the name already exists', async () => {
    const newWeaponData = {
      name: 'Test Unique Weapon',
      attackDamage: 20,
      specialBonus: "Cleave"
    };
    await Weapon.create({
      name: 'Test Unique Weapon',
      attackDamage: 20,
      specialBonus: "Cleave"
    });
    const response = await request(app)
      .put(`/weapons/${weaponId}`)
      .send(newWeaponData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(403);
    expect(response.body.message).toBe('Resource already exists');
  });
});

describe('DELETE /weapons', () => {
  let validToken;
  let weaponId;
  let inexistentWeaponId;
  let invalidWeaponId;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'admin',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    inexistentWeaponId = "b5507584-d80c-4013-a351-c088f70b30fb";
    invalidWeaponId = "sdfsd";
    await Weapon.sync({ force: true });
  });

  beforeEach(async () => {
      const weapon = await Weapon.create({
        name: 'Test Weapon',
        attackDamage: 20,
        specialBonus: "Cleave"
      });
      
      weaponId = weapon.dataValues.weaponId;
  });

  afterEach(async () => {
    await Weapon.destroy({ where: {} });
  });

  it('deletes weapon and returns 200', async () => {
    const response = await request(app)
      .delete(`/weapons/${weaponId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
    expect(response.body.message).toBe('Record deleted');
  });

  it('returns 404 if the there is no weapon with the specified id', async () => {
    const response = await request(app)
      .delete(`/weapons/${inexistentWeaponId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
    expect(response.body.error).toBe('Record not found');
  });

  it('returns 400 if the id is invalid', async () => {
    const response = await request(app)
      .delete(`/weapons/${invalidWeaponId}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input syntax for type uuid: \"${invalidWeaponId}\"`);
  });
});


// Character

describe('GET /characters/sync', () => {
  let validToken;
  let invalidToken;
  let unauthorizedToken;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'sync_manager',
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
    await CharacterAchievement.sync({ force: true });
    await Character.sync({ force: true });

    const character1 = await Character.create({
      name: 'Test Character 1',
      level: 5,
      accountId: '0774fb22-ba8f-4f5d-b716-2699da5129f2'
    });
    const character2 = await Character.create({
      name: 'Test Character 2',
      level: 15,
      accountId: '0774fb22-ba8f-4f5d-b716-2699da5129f2'
    });

    const achievement1 = await Achievement.create({
      name: 'Test Achievement 1',
      points: 100,
      requirements: 'Test Requirements 1',
    });
    const achievement2 = await Achievement.create({
      name: 'Test Achievement 2',
      points: 50,
      requirements: 'Test Requirements 2',
    });
    const achievement3 = await Achievement.create({
      name: 'Test Achievement 3',
      points: 20,
      requirements: 'Test Requirements 3',
    });

    await CharacterAchievement.create({
      characterId: character1.dataValues.characterId,
      achievementId: achievement1.dataValues.achievementId
    });
    await CharacterAchievement.create({
      characterId: character1.dataValues.characterId,
      achievementId: achievement2.dataValues.achievementId
    });
    await CharacterAchievement.create({
      characterId: character2.dataValues.characterId,
      achievementId: achievement2.dataValues.achievementId
    });
    await CharacterAchievement.create({
      characterId: character2.dataValues.characterId,
      achievementId: achievement3.dataValues.achievementId
    });

  });

  afterAll(async () => {
    await Character.destroy({ where: {} });
    await Achievement.destroy({ where: {} });
    await CharacterAchievement.destroy({ where: {} });
  });

  it('should return all characters', async () => {
    const response = await request(app)
      .get('/characters/sync')
      .set('Authorization', `Bearer ${validToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('Test Character 1');
    expect(response.body[0].level).toBe(5);
    expect(response.body[0].achievements).toHaveLength(2);
    expect(response.body[0].achievements[0].name).toBe('Test Achievement 1');
    expect(response.body[0].achievements[0].points).toBe(100);
    expect(response.body[0].achievements[1].name).toBe('Test Achievement 2');
    expect(response.body[0].achievements[1].points).toBe(50);
    expect(response.body[1].name).toBe('Test Character 2');
    expect(response.body[1].level).toBe(15);
    expect(response.body[1].achievements).toHaveLength(2);
    expect(response.body[1].achievements[0].name).toBe('Test Achievement 2');
    expect(response.body[1].achievements[0].points).toBe(50);
    expect(response.body[1].achievements[1].name).toBe('Test Achievement 3');
    expect(response.body[1].achievements[1].points).toBe(20);
  });

  it('returns 401 if the token is invalid', async () => {
    const response = await request(app)
      .get('/characters/sync')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Token is not valid'
    );
  });

  it("returns 401 if the user doesn't have the necessary role", async () => {
    const response = await request(app)
      .get('/characters/sync')
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Not authorized'
    );
  });
});

describe('GET /characters/sync/:id', () => {
  let validToken;
  let invalidToken;
  let unauthorizedToken;
  let characterId;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'sync_manager',
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
    await CharacterAchievement.sync({ force: true });
    await Character.sync({ force: true });

    const character1 = await Character.create({
      name: 'Test Character 1',
      level: 5,
      accountId: '0774fb22-ba8f-4f5d-b716-2699da5129f2'
    });
    characterId = character1.dataValues.characterId;
    const character2 = await Character.create({
      name: 'Test Character 2',
      level: 15,
      accountId: '0774fb22-ba8f-4f5d-b716-2699da5129f2'
    });

    const achievement1 = await Achievement.create({
      name: 'Test Achievement 1',
      points: 100,
      requirements: 'Test Requirements 1',
    });
    const achievement2 = await Achievement.create({
      name: 'Test Achievement 2',
      points: 50,
      requirements: 'Test Requirements 2',
    });
    const achievement3 = await Achievement.create({
      name: 'Test Achievement 3',
      points: 20,
      requirements: 'Test Requirements 3',
    });

    await CharacterAchievement.create({
      characterId: character1.dataValues.characterId,
      achievementId: achievement1.dataValues.achievementId
    });
    await CharacterAchievement.create({
      characterId: character1.dataValues.characterId,
      achievementId: achievement2.dataValues.achievementId
    });
    await CharacterAchievement.create({
      characterId: character2.dataValues.characterId,
      achievementId: achievement2.dataValues.achievementId
    });
    await CharacterAchievement.create({
      characterId: character2.dataValues.characterId,
      achievementId: achievement3.dataValues.achievementId
    });

  });

  afterAll(async () => {
    await Character.destroy({ where: {} });
    await Achievement.destroy({ where: {} });
    await CharacterAchievement.destroy({ where: {} });
  });

  it('should return one character', async () => {
    const response = await request(app)
      .get(`/characters/sync/${characterId}`)
      .set('Authorization', `Bearer ${validToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Test Character 1');
    expect(response.body[0].level).toBe(5);
    expect(response.body[0].achievements).toHaveLength(2);
    expect(response.body[0].achievements[0].name).toBe('Test Achievement 1');
    expect(response.body[0].achievements[0].points).toBe(100);
    expect(response.body[0].achievements[1].name).toBe('Test Achievement 2');
    expect(response.body[0].achievements[1].points).toBe(50);
  });

  it('returns 401 if the token is invalid', async () => {
    const response = await request(app)
      .get(`/characters/sync/${characterId}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Token is not valid'
    );
  });

  it("returns 401 if the user doesn't have the necessary role", async () => {
    const response = await request(app)
      .get(`/characters/sync/${characterId}`)
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Not authorized'
    );
  });
});

describe('PATCH /characters/sync/:id', () => {
  let validToken;
  let invalidToken;
  let unauthorizedToken;
  let characterId;
  let inexistingCharacterId = 'e36a7649-07da-479c-8acc-2c45f2047335';
  let invalidCharacterId = 'sfertgeg';
  let achievementId1;
  let achievementId2;
  let achievementId3;
  beforeAll(async () => {
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'sync_manager',
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
    await CharacterAchievement.sync({ force: true });
    await Character.sync({ force: true });

    const character1 = await Character.create({
      name: 'Test Character 1',
      level: 5,
      accountId: '0774fb22-ba8f-4f5d-b716-2699da5129f2'
    });
    characterId = character1.dataValues.characterId;
    const character2 = await Character.create({
      name: 'Test Character 2',
      level: 15,
      accountId: '0774fb22-ba8f-4f5d-b716-2699da5129f2'
    });

    const achievement1 = await Achievement.create({
      name: 'Test Achievement 1',
      points: 100,
      requirements: 'Test Requirements 1',
    });
    achievementId1 = achievement1.dataValues.achievementId;
    const achievement2 = await Achievement.create({
      name: 'Test Achievement 2',
      points: 50,
      requirements: 'Test Requirements 2',
    });
    achievementId2 = achievement2.dataValues.achievementId;
    const achievement3 = await Achievement.create({
      name: 'Test Achievement 3',
      points: 20,
      requirements: 'Test Requirements 3',
    });
    achievementId3 = achievement3.dataValues.achievementId;

    await CharacterAchievement.create({
      characterId: character1.dataValues.characterId,
      achievementId: achievement1.dataValues.achievementId
    });

  });

  afterAll(async () => {
    await Character.destroy({ where: {} });
    await Achievement.destroy({ where: {} });
    await CharacterAchievement.destroy({ where: {} });
  });

  it('updates old character and returns 200', async () => {
    const newCharacterData = {
      level: 20,
      achievements: [
        {
          achievementId: achievementId2
        },
        {
          achievementId: achievementId3
        }
      ]
    };

    const response = await request(app)
      .patch(`/characters/sync/${characterId}`)
      .send(newCharacterData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
      expect(response.body.name).toBe('Test Character 1');
      expect(response.body.level).toBe(20);
      expect(response.body.achievements).toHaveLength(2);
      expect(response.body.achievements[0].name).toBe('Test Achievement 2');
      expect(response.body.achievements[0].points).toBe(50);
      expect(response.body.achievements[1].name).toBe('Test Achievement 3');
      expect(response.body.achievements[1].points).toBe(20);
  });
    
  it('returns 404 if the there is no character with the specified id', async () => {
    const newCharacterData = {
      level: 20,
      achievements: [
        {
          achievementId: achievementId2
        },
        {
          achievementId: achievementId3
        }
      ]
    };

    const response = await request(app)
      .patch(`/characters/sync/${inexistingCharacterId}`)
      .send(newCharacterData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
    expect(response.body.error).toBe('Record not found');
  });
    
  it('returns 400 if the id is invalid', async () => {
    const newCharacterData = {
      level: 20,
      achievements: [
        {
          achievementId: achievementId2
        },
        {
          achievementId: achievementId3
        }
      ]
    };

    const response = await request(app)
      .patch(`/characters/sync/${invalidCharacterId}`)
      .send(newCharacterData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input syntax for type uuid: \"${invalidCharacterId}\"`);
  });

  it('returns 401 if the token is invalid', async () => {
    const response = await request(app)
      .get(`/characters/sync/${characterId}`)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Token is not valid'
    );
  });
  
  it("returns 401 if the user doesn't have the necessary role", async () => {
    const response = await request(app)
      .get(`/characters/sync/${characterId}`)
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Not authorized'
    );
  });
});

describe('GET /characters/:id', () => {
  let character;
  let weapon;
  let helmet;
  let chestplate;
  let leggings;
  let boots;
  let achievement1;
  let achievement2;
  let ability1;
  let ability2;
  let userId = 'aeb8bceb-c1d9-4cc8-96c3-6ebf4f283103'
  let inexistingUserId = '71903946-f557-49e0-a4f8-9cad4720c440';
  let invalidUserId = 'asdasd';

  beforeAll(async () => {
    // await User.sync({ force: true });
    await Character.sync({ force: true });
    await Armor.sync({ force: true });
    await Weapon.sync({ force: true });
    await Ability.sync({ force: true });
    await Achievement.sync({ force: true });
    await CharacterAbility.sync({ force: true });
    await CharacterAchievement.sync({ force: true });

    weapon = await Weapon.create({
      name: 'Sword',
    });

    helmet = await Armor.create({
      name: 'Helmet',
    });
    chestplate = await Armor.create({
      name: 'Chestplate',
    });
    leggings = await Armor.create({
      name: 'Leggings',
    });
    boots = await Armor.create({
      name: 'Boots',
    });

    ability1 = await Ability.create({
      name: 'Fire Ball',
    });
    ability2 = await Ability.create({
      name: 'Freeze',
    });

    achievement1 = await Achievement.create({
      name: 'First Kill',
      points: 15
    });
    achievement2 = await Achievement.create({
      name: 'Level Up',
      points: 20
    });

    character = await Character.create({
      name: 'John',
      level: 10,
      weaponId: weapon.dataValues.weaponId,
      helmetId: helmet.dataValues.armorId,
      chestplateId: chestplate.dataValues.armorId,
      leggingsId: leggings.dataValues.armorId,
      bootsId: boots.dataValues.armorId,
      accountId: userId 
    });

    await CharacterAbility.create({ 
      characterId: character.dataValues.characterId, 
      abilityId: ability1.dataValues.abilityId
    });
    await CharacterAbility.create({ 
      characterId: character.dataValues.characterId,
      abilityId: ability2.dataValues.abilityId
    });
    await CharacterAchievement.create({ 
      characterId: character.dataValues.characterId, 
      achievementId: achievement1.dataValues.achievementId 
    });
    await CharacterAchievement.create({ 
      characterId: character.dataValues.characterId, 
      achievementId: achievement2.dataValues.achievementId 
    });
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
    await Character.destroy({ where: {} });
    await Armor.destroy({ where: {} });
    await Weapon.destroy({ where: {} });
    await Ability.destroy({ where: {} });
    await Achievement.destroy({ where: {} });
    await CharacterAbility.destroy({ where: {} });
    await CharacterAchievement.destroy({ where: {} });
  });

  it('responds with 200 and returns the character with the given ID', async () => {
    const res = await request(app).get(`/characters/${userId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toBe('John');
    expect(res.body.level).toBe(10);
    expect(res.body.weapon.name).toBe('Sword');
    expect(res.body.helmet.name).toBe('Helmet');
    expect(res.body.chestplate.name).toBe('Chestplate');
    expect(res.body.leggings.name).toBe('Leggings');
    expect(res.body.boots.name).toBe('Boots');
    expect(res.body.abilities).toHaveLength(2);
    expect(res.body.abilities[0].name).toBe('Fire Ball');
    expect(res.body.abilities[1].name).toBe('Freeze');
    expect(res.body.achievements).toHaveLength(2);
    expect(res.body.achievements[0].name).toBe('First Kill');
    expect(res.body.achievements[1].name).toBe('Level Up');
    expect(res.body.points).toEqual(35);
  });

  it('returns 404 if the there is no character with the specified id', async () => {
    const response = await request(app)
      .get(`/characters/${inexistingUserId}`)
      .expect(404);
    expect(response.body.error).toBe('Record not found');
  });

  it('returns 400 if the id is invalid', async () => {
    const response = await request(app)
      .get(`/characters/${invalidUserId}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input syntax for type uuid: \"${invalidUserId}\"`);
  });
});

describe('PATCH /characters/:id', () => {
  let validToken;
  let invalidToken;
  let unauthorizedToken;
  let userId = 'aeb8bceb-c1d9-4cc8-96c3-6ebf4f283103'
  let inexistingCharacterId = 'e36a7649-07da-479c-8acc-2c45f2047335';
  let invalidCharacterId = 'sfertgeg';
  let character;
  let weapon1;
  let helmet1;
  let chestplate1;
  let leggings1;
  let boots1;
  let achievement1;
  let achievement2;
  let ability1;
  let ability2;
  let ability3;
  beforeAll(async () => {
    unauthorizedToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'sync_manager',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    invalidToken = 'sdfsdf';
    validToken = jwt.sign({
      userId: '1',
      username: 'admin@pop.com',
      role: 'client',
      name: 'Admin'
    }, 'secret', {expiresIn: 60 * 300});
    await Character.sync({ force: true });
    await Armor.sync({ force: true });
    await Weapon.sync({ force: true });
    await Ability.sync({ force: true });
    await Achievement.sync({ force: true });
    await CharacterAbility.sync({ force: true });
    await CharacterAchievement.sync({ force: true });

    let weapon = await Weapon.create({
      name: 'Sword',
    });

    let helmet = await Armor.create({
      name: 'Helmet',
    });
    let chestplate = await Armor.create({
      name: 'Chestplate',
    });
    let leggings = await Armor.create({
      name: 'Leggings',
    });
    let boots = await Armor.create({
      name: 'Boots',
    });

    weapon1 = await Weapon.create({
      name: 'Sword1',
    });

    helmet1 = await Armor.create({
      name: 'Helmet1',
    });
    chestplate1 = await Armor.create({
      name: 'Chestplate1',
    });
    leggings1 = await Armor.create({
      name: 'Leggings1',
    });
    boots1 = await Armor.create({
      name: 'Boots1',
    });

    ability1 = await Ability.create({
      name: 'Fire Ball',
    });
    ability2 = await Ability.create({
      name: 'Freeze',
    });
    ability3 = await Ability.create({
      name: 'Arcane Comet',
    });

    achievement1 = await Achievement.create({
      name: 'First Kill',
      points: 15
    });
    achievement2 = await Achievement.create({
      name: 'Level Up',
      points: 20
    });

    character = await Character.create({
      name: 'John',
      level: 10,
      weaponId: weapon.dataValues.weaponId,
      helmetId: helmet.dataValues.armorId,
      chestplateId: chestplate.dataValues.armorId,
      leggingsId: leggings.dataValues.armorId,
      bootsId: boots.dataValues.armorId,
      accountId: userId 
    });

    await CharacterAbility.create({ 
      characterId: character.dataValues.characterId, 
      abilityId: ability1.dataValues.abilityId
    });
    await CharacterAbility.create({ 
      characterId: character.dataValues.characterId,
      abilityId: ability2.dataValues.abilityId
    });
    await CharacterAchievement.create({ 
      characterId: character.dataValues.characterId, 
      achievementId: achievement1.dataValues.achievementId 
    });
    await CharacterAchievement.create({ 
      characterId: character.dataValues.characterId, 
      achievementId: achievement2.dataValues.achievementId 
    });

    

  });

  afterAll(async () => {
    await User.destroy({ where: {} });
    await Character.destroy({ where: {} });
    await Armor.destroy({ where: {} });
    await Weapon.destroy({ where: {} });
    await Ability.destroy({ where: {} });
    await Achievement.destroy({ where: {} });
    await CharacterAbility.destroy({ where: {} });
    await CharacterAchievement.destroy({ where: {} });
  });

  it('updates old character and returns 200', async () => {
    const newCharacterData = {
      weapon: weapon1.dataValues,
      helmet: helmet1.dataValues,
      chestplate: chestplate1.dataValues,
      leggings: leggings1.dataValues,
      boots: boots1.dataValues,
      achievements: [achievement1.dataValues, achievement2.dataValues],
      abilities: [ability2.dataValues, ability3.dataValues]
    };

    const response = await request(app)
      .patch(`/characters/${character.dataValues.characterId}`)
      .send(newCharacterData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);
      expect(response.body.name).toBe('John');
      expect(response.body.level).toBe(10);
      expect(response.body.weapon.name).toBe('Sword1');
      expect(response.body.helmet.name).toBe('Helmet1');
      expect(response.body.chestplate.name).toBe('Chestplate1');
      expect(response.body.leggings.name).toBe('Leggings1');
      expect(response.body.boots.name).toBe('Boots1');
      expect(response.body.abilities).toHaveLength(2);
      expect(response.body.abilities[0].name).toBe('Freeze');
      expect(response.body.abilities[1].name).toBe('Arcane Comet');
      expect(response.body.achievements).toHaveLength(2);
      expect(response.body.achievements[0].name).toBe('First Kill');
      expect(response.body.achievements[1].name).toBe('Level Up');
      expect(response.body.points).toBe(35);
  });
    
  it('returns 404 if the there is no character with the specified id', async () => {
    const newCharacterData = {
      weapon: weapon1.dataValues,
      helmet: helmet1.dataValues,
      chestplate: chestplate1.dataValues,
      leggings: leggings1.dataValues,
      boots1: boots1.dataValues,
      achievements: [achievement1.dataValues, achievement2.dataValues],
      abilities: [ability2.dataValues, ability3.dataValues]
    };

    const response = await request(app)
      .patch(`/characters/${inexistingCharacterId}`)
      .send(newCharacterData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
    expect(response.body.error).toBe('Record not found');
  });
    
  it('returns 400 if the id is invalid', async () => {
    const newCharacterData = {
      weapon: weapon1.dataValues,
      helmet: helmet1.dataValues,
      chestplate: chestplate1.dataValues,
      leggings: leggings1.dataValues,
      boots1: boots1.dataValues,
      achievements: [achievement1.dataValues, achievement2.dataValues],
      abilities: [ability2.dataValues, ability3.dataValues]
    };

    const response = await request(app)
      .patch(`/characters/${invalidCharacterId}`)
      .send(newCharacterData)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);
    expect(response.body.message).toBe(`invalid input syntax for type uuid: \"${invalidCharacterId}\"`);
  });

  it('returns 401 if the token is invalid', async () => {
    const newCharacterData = {
      weapon: weapon1.dataValues,
      helmet: helmet1.dataValues,
      chestplate: chestplate1.dataValues,
      leggings: leggings1.dataValues,
      boots1: boots1.dataValues,
      achievements: [achievement1.dataValues, achievement2.dataValues],
      abilities: [ability2.dataValues, ability3.dataValues]
    };
    const response = await request(app)
      .patch(`/characters/${character.dataValues.characterId}`)
      .send(newCharacterData)
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Token is not valid'
    );
  });
  
  it("returns 401 if the user doesn't have the necessary role", async () => {
    const newCharacterData = {
      weapon: weapon1.dataValues,
      helmet: helmet1.dataValues,
      chestplate: chestplate1.dataValues,
      leggings: leggings1.dataValues,
      boots1: boots1.dataValues,
      achievements: [achievement1.dataValues, achievement2.dataValues],
      abilities: [ability2.dataValues, ability3.dataValues]
    };
    const response = await request(app)
      .patch(`/characters/${character.dataValues.characterId}`)
      .send(newCharacterData)
      .set('Authorization', `Bearer ${unauthorizedToken}`)
      .expect(401);
    expect(response.body.message).toBe(
      'Not authorized'
    );
  });
});
