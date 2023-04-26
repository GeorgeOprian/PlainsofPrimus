import { Router } from "express";
import { Achievement } from "../models/achievement.js";
import { checkRole } from "./middleware.js";

const router = Router();

router.post('/', checkRole(['admin']), async (req, res, next) => {
    Achievement.create(req.body)
    .then((item) => res.status(201).json(item))
    .catch (next);
});

router.put('/:id', checkRole(['admin']), (req, res, next) => {
    Achievement.update(req.body, {
      where: { achievement_id: req.params.id },
      returning: true
    })
    .then(([ affectedCount, affectedRows ]) => {
        if (affectedCount) res.json(affectedRows[0]);
        else res.status(404).json({ error: 'Record not found' });
    })
    .catch (next);
});

router.delete('/:id', checkRole(['admin']), (req, res, next) => {
    Achievement.destroy({
        where: { achievement_id: req.params.id },
    })
    .then(affectedCount => {
        if (affectedCount) res.json({ message: 'Record deleted' });
        else res.status(404).json({ error: 'Record not found' });
    })
    .catch(next);
});

export { router as achievementRouter };