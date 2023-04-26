import { DataTypes, Model } from "sequelize";
import { SequelizeService } from "../config/db.js";

export class Character extends Model {
  characterId;
  name;
  level;
  weaponId;
  helmetId;
  chestplateId;
  leggingsId;
  bootsId;
  accountId;
}

Character.init(
  {
    characterId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
      field: "character_id",
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: "name",
    },
    level: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 100
      },
      allowNull: false,
      field: "level",
    },
    weaponId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "weapon_id",
    },
    helmetId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "helmet_id",
    },
    chestplateId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "chestplate_id",
    },
    leggingsId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "leggings_id",
    },
    bootsId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "boots_id",
    },
    accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "account_id",
    },
  },
  {
    sequelize: SequelizeService.getInstance(),
    modelName: "Character",
    tableName: "characters",
    createdAt: false,
    updatedAt: false
  }
);
