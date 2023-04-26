import { DataTypes, Model } from "sequelize";
import { SequelizeService } from "../config/db.js";

export class Weapon extends Model {
  weaponId;
  name;
  image;
  attackDamage;
  specialBonus;
  achievementId;
}

Weapon.init(
  {
    weaponId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
      field: "weapon_id",
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: "name",
    },
    image: {
      type: DataTypes.STRING(5000),
      allowNull: true,
      field: "image",
    },
    attackDamage: {
      type: DataTypes.INTEGER,
      validate: {
        min: 20,
        max: 500
      },
      allowNull: true,
      field: "attack_damage",
    },
    specialBonus: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: "special_bonus",
    },
    achievementId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "achievement_id",
    },
  },
  {
    sequelize: SequelizeService.getInstance(),
    modelName: "Weapon",
    tableName: "weapons",
    createdAt: false,
    updatedAt: false
  }
);
