import { DataTypes, Model } from "sequelize";
import { SequelizeService } from "../config/db.js";

export class Armor extends Model {
  armorId;
  name;
  image;
  type;
  armor;
  health;
  strength;
  intellect;
  agility;
  achievementId;
}

Armor.init(
  {
    armorId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
      field: "armor_id",
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      field: "name",
    },
    image: {
      type: DataTypes.STRING(5000),
      allowNull: true,
      field: "image",
    },
    type: {
      type: DataTypes.ENUM,
      values: ['chestplate', 'helmet', 'legging', 'boots'],
      allowNull: true,
      field: "type",
    },
    armor: {
      type: DataTypes.INTEGER,
      validate: {
        min: 10,
        max: 100
      },
      allowNull: true,
      field: "armor",
    },
    health: {
      type: DataTypes.INTEGER,
      validate: {
        min: 10,
        max: 100
      },
      allowNull: true,
      field: "health",
    },
    strength: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 100
      },
      allowNull: true,
      field: "strength",
    },
    intellect: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 100
      },
      allowNull: true,
      field: "intellect",
    },
    agility: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 100
      },
      allowNull: true,
      field: "agility",
    },
    achievementId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "achievement_id",
    },
  },
  {
    sequelize: SequelizeService.getInstance(),
    modelName: "Armor",
    tableName: "armors",
    createdAt: false,
    updatedAt: false
  }
);
