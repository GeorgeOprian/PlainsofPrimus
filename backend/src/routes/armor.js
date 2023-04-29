import { Router } from "express";
import { Armor } from "../models/armor.js";
import { checkRole } from "./middleware.js";

const router = Router();

router.get('/', async (req, res) => {
    Armor.findAll({
        raw:true
    })
    .then(records => {
        res.json(records)
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/achievements/', checkRole(['client']), async (req, res) => {
    Promise.all(req.body.map(async item => {
        return await Armor.findAll({
            where: { achievement_id: item.achievementId },
            raw:true
        })
    }))
    .then(records => {
        res.json([].concat.apply([], records))
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/:id', async (req, res) => {
    Armor.findAll({
        where: { armor_id: req.params.id },
        raw:true
    })
    .then(record => {
        res.json(record)
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.post('/', checkRole(['admin']), async (req, res, next) => {
    Armor.create(req.body)
    .then((item) => res.status(201).json(item))
    .catch (next);
});

router.put('/:id', checkRole(['admin']), (req, res, next) => {
    Armor.update(req.body, {
      where: { armor_id: req.params.id },
      returning: true
    })
    .then(([ affectedCount, affectedRows ]) => {
        if (affectedCount) res.json(affectedRows[0]);
        else res.status(404).json({ error: 'Record not found' });
    })
    .catch (next);
});

router.delete('/:id', checkRole(['admin']), (req, res, next) => {
    Armor.destroy({
        where: { armor_id: req.params.id },
    })
    .then(affectedCount => {
        if (affectedCount) res.json({ message: 'Record deleted' });
        else res.status(404).json({ error: 'Record not found' });
    })
    .catch(next);
});

export { router as armorRouter };