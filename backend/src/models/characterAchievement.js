import { DataTypes, Model } from "sequelize";
import { SequelizeService } from "../config/db.js";

export class CharacterAchievement extends Model {
  id;
  characterId;
  achievementId;
}

CharacterAchievement.init(
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
    achievementId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "achievement_id",
    },
  },
  {
    sequelize: SequelizeService.getInstance(),
    modelName: "CharacterAchievement",
    tableName: "character_achievements",
    createdAt: false,
    updatedAt: false
  }
);
