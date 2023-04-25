import { Router } from "express";
import { User } from "../models/user.js";

const router = Router();

router.post('/register', async (req, res, next) => {
    const { username, password, name } = req.body;
    User.create({
        username,
        password,
        role: 'client',
        name
    })
    .then((item) => res.status(201).json(item))
    .catch (next);
});

export { router as userRouter };