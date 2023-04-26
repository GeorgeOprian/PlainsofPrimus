import { Router } from "express";
import { User } from "../models/user.js";
import { Character } from "../models/character.js";

const router = Router();

router.post('/register', async (req, res, next) => {
    const { username, password, name } = req.body;
    User.create({
        username,
        password,
        role: 'client',
        name
    })
    .then(async (item) => {
        await Character.create({
            name,
            level: 1,
            accountId: item.dataValues.userId
        });
        return res.status(201).json(item);
    })
    .catch (next);
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    User.findOne({
        where: {
            username
        }
    }).then(async user => {
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (!(await User.validPassword(password, user.dataValues.password))) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = user.generateJWT();
        return res.status(200).json({ token });
    });
});

export { router as userRouter };