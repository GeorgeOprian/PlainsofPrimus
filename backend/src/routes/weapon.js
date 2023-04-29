import { Router } from "express";
import { Weapon } from "../models/weapon.js";
import { checkRole } from "./middleware.js";

const router = Router();

router.get('/', async (req, res) => {
    Weapon.findAll({
        raw:true
    })
    .then(records => {
        res.json(records)
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/achievements/', checkRole(['client']), async (req, res) => {
    Promise.all(req.body.map(async item => {
        return await Weapon.findAll({
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
    Weapon.findAll({
        where: { weapon_id: req.params.id },
        raw:true
    })
    .then(record => {
        res.json(record)
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.post('/', checkRole(['admin']), async (req, res, next) => {
    Weapon.create(req.body)
    .then((item) => res.status(201).json(item))
    .catch (next);
});

router.put('/:id', checkRole(['admin']), (req, res, next) => {
    Weapon.update(req.body, {
      where: { weapon_id: req.params.id },
      returning: true
    })
    .then(([ affectedCount, affectedRows ]) => {
        if (affectedCount) res.json(affectedRows[0]);
        else res.status(404).json({ error: 'Record not found' });
    })
    .catch (next);
});

router.delete('/:id', checkRole(['admin']), (req, res, next) => {
    Weapon.destroy({
        where: { weapon_id: req.params.id },
    })
    .then(affectedCount => {
        if (affectedCount) res.json({ message: 'Record deleted' });
        else res.status(404).json({ error: 'Record not found' });
    })
    .catch(next);
});

export { router as weaponRouter };