import { Router } from "express";
import { User } from "../models/user.js";
import { Character } from "../models/character.js";
import { Ability } from "../models/ability.js";
import { Achievement } from "../models/achievement.js";
import { Armor } from "../models/armor.js";
import { Weapon } from "../models/weapon.js";
import { CharacterAbility } from "../models/characterAbility.js";
import { CharacterAchievement } from "../models/characterAchievement.js";
import { checkRole } from "./middleware.js";
import { SequelizeService } from "../config/db.js";
import { Sequelize } from "sequelize";

const router = Router();
const sequelize = SequelizeService.getInstance();

router.get('/sync', checkRole(['sync_manager']), async (req, res) => {
    Character.findAll({
        raw:true
    })
    .then(async records => {
        let characters = await Promise.all(records.map(async item => {
            const achievements = await sequelize.query(
                `SELECT *
                 FROM "achievements"
                 INNER JOIN "character_achievements" ON "achievements"."achievement_id" = "character_achievements"."achievement_id"
                 WHERE "character_achievements"."character_id" = :characterId`,
                {
                  replacements: { characterId: item.characterId},
                  type: Sequelize.QueryTypes.SELECT,
                  model: Achievement,
                  mapToModel: true,
                  include: [CharacterAchievement],
                }
            );
            return {
                characterId: item.characterId,
                name: item.name,
                level: item.level,
                achievements
            }
        }));
        res.json(characters)
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/sync/:id', checkRole(['sync_manager']), async (req, res) => {
    Character.findAll({
        where: { character_id: req.params.id },
        raw:true
    })
    .then(async records => {
        let characters = await Promise.all(records.map(async item => {
            const achievements = await sequelize.query(
                `SELECT *
                 FROM "achievements"
                 INNER JOIN "character_achievements" ON "achievements"."achievement_id" = "character_achievements"."achievement_id"
                 WHERE "character_achievements"."character_id" = :characterId`,
                {
                  replacements: { characterId: item.characterId},
                  type: Sequelize.QueryTypes.SELECT,
                  model: Achievement,
                  mapToModel: true,
                  include: [CharacterAchievement],
                }
            );
            return {
                characterId: item.characterId,
                name: item.name,
                level: item.level,
                achievements
            }
        }));
        res.json(characters)
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/:id', async (req, res) => {
    let accountId = req.params.id;
    Character.findOne({
        where: {
            accountId
        }
    }).then(async character => {
        if (!character) {
            return res.status(401).json({ message: 'character not found' });
        }
        let weapon;
        if (character.dataValues.weaponId) {
            weapon = await Weapon.findOne({
                where: {
                    weaponId: character.dataValues.weaponId
                }
            });
        }
        let helmet;
        if (character.dataValues.helmetId) {
            helmet = await Armor.findOne({
                where: {
                    armorId: character.dataValues.helmetId
                }
            });
        }

        let chestplate;
        if (character.dataValues.chestplateId) {
            chestplate = await Armor.findOne({
                where: {
                    armorId: character.dataValues.chestplateId
                }
            });
        }

        let leggings;
        if (character.dataValues.leggingsId) {
            leggings = await Armor.findOne({
                where: {
                    armorId: character.dataValues.leggingsId
                }
            });
        }

        let boots;
        if (character.dataValues.bootsId) {
            boots = await Armor.findOne({
                where: {
                    armorId: character.dataValues.bootsId
                }
            });
        }

        const abilities = await sequelize.query(
            `SELECT *
             FROM "abilities"
             INNER JOIN "character_abilities" ON "abilities"."ability_id" = "character_abilities"."ability_id"
             WHERE "character_abilities"."character_id" = :characterId`,
            {
              replacements: { characterId: character.dataValues.characterId},
              type: Sequelize.QueryTypes.SELECT,
              model: Ability,
              mapToModel: true,
              include: [CharacterAbility],
            }
        );

        let points = 0;
        const achievements = await sequelize.query(
            `SELECT *
             FROM "achievements"
             INNER JOIN "character_achievements" ON "achievements"."achievement_id" = "character_achievements"."achievement_id"
             WHERE "character_achievements"."character_id" = :characterId`,
            {
              replacements: { characterId: character.dataValues.characterId},
              type: Sequelize.QueryTypes.SELECT,
              model: Achievement,
              mapToModel: true,
              include: [CharacterAchievement],
            }
        );
        achievements.forEach(item => {
            if (item.points) {
                points += item.points;
            }
        });

        let newCharacter = {
            characterId: character.dataValues.characterId,
            name: character.dataValues.name,
            level: character.dataValues.level,
            weapon,
            helmet,
            chestplate,
            leggings,
            boots,
            abilities,
            achievements,
            points
        }

        return res.status(200).json({ newCharacter });
    });
});

export { router as characterRouter };