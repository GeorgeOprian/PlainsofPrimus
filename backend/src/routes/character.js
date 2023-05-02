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
                `SELECT "achievements"."achievement_id", "achievements"."name", "achievements"."points", "achievements"."requirements"
                 FROM "achievements"
                 INNER JOIN "character_achievements" ON "achievements"."achievement_id" = "character_achievements"."achievement_id"
                 WHERE "character_achievements"."character_id" = :characterId
                 ORDER BY "achievements"."name"`,
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
                `SELECT "achievements"."achievement_id", "achievements"."name", "achievements"."points", "achievements"."requirements"
                 FROM "achievements"
                 INNER JOIN "character_achievements" ON "achievements"."achievement_id" = "character_achievements"."achievement_id"
                 WHERE "character_achievements"."character_id" = :characterId
                 ORDER BY "achievements"."name"`,
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

router.get('/:id', async (req, res, next) => {
    let accountId = req.params.id;
    Character.findOne({
        where: {
            accountId
        }
    }).then(async character => {
        if (!character) {
            return res.status(404).json({ error: 'Record not found' });
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
            `SELECT "abilities"."ability_id", "abilities"."name", "abilities"."level_requirement", "abilities"."scales_with", "abilities"."effect"
             FROM "abilities"
             INNER JOIN "character_abilities" ON "abilities"."ability_id" = "character_abilities"."ability_id"
             WHERE "character_abilities"."character_id" = :characterId
             ORDER BY "abilities"."name"`,
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
            `SELECT "achievements"."achievement_id", "achievements"."name", "achievements"."points", "achievements"."requirements"
             FROM "achievements"
             INNER JOIN "character_achievements" ON "achievements"."achievement_id" = "character_achievements"."achievement_id"
             WHERE "character_achievements"."character_id" = :characterId
             ORDER BY "achievements"."name"`,
            {
              replacements: { characterId: character.dataValues.characterId},
              type: Sequelize.QueryTypes.SELECT,
              model: Achievement,
              mapToModel: true,
              include: [CharacterAchievement],
            }
        );
        achievements.forEach(item => {
            if (item.dataValues.points) {
                points += item.dataValues.points;
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

        return res.status(200).json( newCharacter );
    })
    .catch(next);
}); //client userId

router.patch('/:id', checkRole(['client']), (req, res, next) => {
    const {name, weapon, helmet, chestplate, leggings, boots, abilities, achievements} = req.body;
    
    Character.update({
        name: name,
        weaponId: weapon ? weapon.weaponId: null,
        helmetId: helmet? helmet.armorId: null,
        chestplateId: chestplate? chestplate.armorId : null,
        leggingsId: leggings? leggings.armorId: null,
        bootsId: boots? boots.armorId: null
    }, {
      where: { character_id: req.params.id },
      returning: true
    })
    .then(async ([ affectedCount, affectedRows ]) => {
        if (affectedCount) {
            let character = {
                characterId: affectedRows[0].dataValues.characterId,
                name: affectedRows[0].dataValues.name,
                level: affectedRows[0].dataValues.level,
                accountId: affectedRows[0].dataValues.accountId,
                weapon,
                helmet,
                chestplate,
                leggings,
                boots,
                achievements,
            }
            
            await CharacterAbility.destroy({
                where: { character_id: req.params.id },
            });
            await Promise.all(abilities.map(async item => {
                return await CharacterAbility.create({
                    characterId: character.characterId,
                    abilityId: item.abilityId
                })
            }));

            const newAbilities = await sequelize.query(
                `SELECT "abilities"."ability_id", "abilities"."name", "abilities"."level_requirement", "abilities"."scales_with", "abilities"."effect"
                 FROM "abilities"
                 INNER JOIN "character_abilities" ON "abilities"."ability_id" = "character_abilities"."ability_id"
                 WHERE "character_abilities"."character_id" = :characterId
                 ORDER BY "abilities"."name"`,
                {
                  replacements: { characterId: character.characterId},
                  type: Sequelize.QueryTypes.SELECT,
                  model: Ability,
                  mapToModel: true,
                  include: [CharacterAbility],
                }
            );
            let points = 0;

            if (achievements) {
                achievements.forEach(item => {
                    if (item.points) {
                        points += item.points;
                    }
                });
            }

            character.abilities = newAbilities;
            character.points = points;

            res.json(character);
        }
        else res.status(404).json({ error: 'Record not found' });
    })
    .catch (next);
});

router.patch('/sync/:id', checkRole(['sync_manager']), (req, res, next) => {
    const {level, achievements} = req.body;
    Character.update({level}, {
      where: { character_id: req.params.id },
      returning: true
    })
    .then(async ([ affectedCount, affectedRows ]) => {
        if (affectedCount) {
            let character = {
                characterId: affectedRows[0].dataValues.characterId,
                name: affectedRows[0].dataValues.name,
                level: affectedRows[0].dataValues.level
            }
            
            await CharacterAchievement.destroy({
                where: { character_id: req.params.id },
            });
            await Promise.all(achievements.map(async item => {
                return await CharacterAchievement.create({
                    characterId: character.characterId,
                    achievementId: item.achievementId
                })
            }));

            const newAchievements = await sequelize.query(
                `SELECT "achievements"."achievement_id", "achievements"."name", "achievements"."points", "achievements"."requirements"
                 FROM "achievements"
                 INNER JOIN "character_achievements" ON "achievements"."achievement_id" = "character_achievements"."achievement_id"
                 WHERE "character_achievements"."character_id" = :characterId
                 ORDER BY "achievements"."name"`,
                {
                  replacements: { characterId: character.characterId},
                  type: Sequelize.QueryTypes.SELECT,
                  model: Achievement,
                  mapToModel: true,
                  include: [CharacterAchievement],
                }
            );
            character.achievements = newAchievements;

            res.json(character);
        }
        else res.status(404).json({ error: 'Record not found' });
    })
    .catch (next);
});

export { router as characterRouter };