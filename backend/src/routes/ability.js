import { Router } from "express";
import { Ability } from "../models/ability.js";
import { checkRole } from "./middleware.js";

const router = Router();

router.post('/', checkRole(['admin']), async (req, res, next) => {
    Ability.create(req.body)
    .then((item) => res.status(201).json(item))
    .catch (next);
});

router.put('/:id', checkRole(['admin']), (req, res, next) => {
    Ability.update(req.body, {
      where: { ability_id: req.params.id },
      returning: true
    })
    .then(([ affectedCount, affectedRows ]) => {
        if (affectedCount) res.json(affectedRows[0]);
        else res.status(404).json({ error: 'Record not found' });
    })
    .catch (next);
});

router.delete('/:id', checkRole(['admin']), (req, res, next) => {
    Ability.destroy({
        where: { ability_id: req.params.id },
    })
    .then(affectedCount => {
        if (affectedCount) res.json({ message: 'Record deleted' });
        else res.status(404).json({ error: 'Record not found' });
    })
    .catch(next);
});

export { router as abilityRouter };