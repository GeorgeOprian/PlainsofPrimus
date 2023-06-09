import express from 'express';
import { SequelizeService } from './config/db.js';
import { userRouter } from './routes/user.js';
import { handleError } from './routes/middleware.js';
import { characterRouter } from './routes/character.js';
import { achievementRouter } from './routes/achievement.js';
import { abilityRouter } from './routes/ability.js';
import dataLoader from './bootstrap/dataLoader.js';
import { armorRouter } from './routes/armor.js';
import { weaponRouter } from './routes/weapon.js';


export const app = express();
app.use(express.json());

// CORS policy
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS, PUT");
    next();
  })

app.get('/health', (req, res) => {
    res.send({
        message: 'Up and running'
    })
});

let sequelize = SequelizeService.getInstance();
// await sequelize.sync();

dataLoader();

app.use('/users', userRouter);
app.use('/characters', characterRouter);
app.use('/achievements', achievementRouter);
app.use('/abilities', abilityRouter);
app.use('/armors', armorRouter);
app.use('/weapons', weaponRouter);

app.use(handleError);

// sequelize.authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch((error) => {
//     console.error('Unable to connect to the database:', error);
//   });

app.listen(4200, (err) => {
    err && console.error(err);
    console.log(`Server started on port: 4200`);
});