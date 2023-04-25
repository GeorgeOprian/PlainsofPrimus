import express from 'express';
import chalk from 'chalk';
import { SequelizeService } from './config/db.js';


const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.send({
        message: 'Up and running'
    })
});

let sequelize = SequelizeService.getInstance();
// await sequelize.sync();

// sequelize.authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch((error) => {
//     console.error('Unable to connect to the database:', error);
//   });

app.listen(4200, (err) => {
    err && console.error(err);
    console.log(chalk.magenta(`Server started on port`), chalk.yellow(4200));
});