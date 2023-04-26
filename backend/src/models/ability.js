import { DataTypes, Model } from "sequelize";
import { SequelizeService } from "../config/db.js";
import { CharacterAbility } from "./characterAbility.js";

export class Ability extends Model {
  abilityId;
  name;
  levelRequirement;
  scalesWith;
  effect;
}

Ability.init(
  {
    abilityId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
      field: "ability_id",
    },
    name: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
      field: "name",
    },
    levelRequirement: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 100
      },
      allowNull: true,
      field: "level_requirement",
    },
    scalesWith: {
      type: DataTypes.ENUM,
      values: ['strength', 'intellect', 'agility'],
      allowNull: true,
      field: "scales_with",
    },
    effect: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: "effect",
    }
  },
  {
    sequelize: SequelizeService.getInstance(),
    modelName: "Ability",
    tableName: "abilities",
    createdAt: false,
    updatedAt: false
  }
);
