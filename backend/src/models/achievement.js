import { DataTypes, Model } from "sequelize";
import { SequelizeService } from "../config/db.js";

export class Achievement extends Model {
  achievementId;
  name;
  points;
  requirements;
}

Achievement.init(
  {
    achievementId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
      field: "achievement_id",
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: "name",
    },
    points: {
      type: DataTypes.INTEGER,
      validate: {
        min: 10,
        max: 150
      },
      allowNull: true,
      field: "points",
    },
    requirements: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: "requirements",
    }
  },
  {
    sequelize: SequelizeService.getInstance(),
    modelName: "Achievement",
    tableName: "achievements",
    createdAt: false,
    updatedAt: false
  }
);
