import { DataTypes, Model } from "sequelize";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SequelizeService } from "../config/db.js";

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
  const data = {
    userId: this.dataValues.userId,
    name: this.dataValues.name,
    username: this.dataValues.username,
    role: this.dataValues.role
  };
  const secret = "secret";

  const token = jwt.sign(data, secret, {expiresIn: 60 * 300});
  return token;
}

// User.sync()
//   .then(() => {
//     // Check if the User table is empty
//     return User.count();
//   })
//   .then(count => {
//     // If the User table is empty, add a default user
//     if (count === 0) {
//       User.create({
//         username: 'admin@pop.com',
//         password: '1234',
//         role: 'admin',
//         name: 'Admin'
//       });
//       User.create({
//         username: 'sync.manager@pop.com',
//         password: '1234',
//         role: 'sync_manager',
//         name: 'Sync Manager'
//       });
//       User.create({
//         username: 'ticket.manager@pop.com',
//         password: '1234',
//         role: 'ticket_manager',
//         name: 'Ticket Manager'
//       });
//     }
//   })
//   .catch(error => {
//     console.error('Error syncing User table:', error);
//   });