import { DataTypes, Model } from "sequelize";
import crypto from 'crypto'
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SequelizeService } from "../config/db.js";

const key = process.env.ENCRYPTION_KEY;

export class User extends Model {
  userId;
  username;
  password;
  role;
  name;
}

User.init(
  {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
      field: "user_id",
    },
    username: {
      type: DataTypes.STRING(320),
      allowNull: false,
      unique: true,
      field: "username",
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: false,
      field: "password",
    },
    role: {
      type: DataTypes.ENUM,
      values: ['client', 'admin', 'sync_manager', 'ticket_manager'],
      defaultValue: 'client',
      allowNull: false,
      field: "role",
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: "name",
    }
  },
  {
    sequelize: SequelizeService.getInstance(),
    modelName: "User",
    tableName: "users",
    createdAt: false,
    updatedAt: false
  }
);

User.beforeCreate(async (user) => {
  user.dataValues.password = await bcrypt.hash(user.dataValues.password, 10);
});

User.validPassword = async (password1, password2) => {
  let result = await bcrypt.compare(password1, password2);
  return result;
}

User.prototype.generateJWT = function () {
  const encrypted = this.dataValues.username;
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  const data = {
    userId: this.dataValues.userId,
    name: this.dataValues.name,
    username: decrypted,
    role: this.dataValues.role
  };
  const secret = "secret";

  const token = jwt.sign(data, secret, {expiresIn: 60 * 300});
  return token;
}