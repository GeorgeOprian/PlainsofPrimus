import { DataTypes, Model } from "sequelize";
import { SequelizeService } from "../config/db.js";

export class CharacterAbility extends Model {
  id;
  characterId;
  abilityId;
}

CharacterAbility.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
      field: "id",
    },
    characterId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "character_id",
    },
    abilityId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "ability_id",
    },
  },
  {
    sequelize: SequelizeService.getInstance(),
    modelName: "CharacterAbility",
    tableName: "character_abilities",
    createdAt: false,
    updatedAt: false
  }
);
