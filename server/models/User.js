const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database'); // Import the Sequelize instance

class User extends Model {}

User.init({
  // Model attributes are defined here
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userName: { // Optional, for display purposes, not unique
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verificationCode: {
    type: DataTypes.STRING,
    allowNull: true, // Only set during verification process
  },
  verificationCodeExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true, // Only set during verification process
  },
  refreshToken: {
    type: DataTypes.STRING(512), // Refresh tokens can be long
    allowNull: true,
  },
  refreshTokenExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // createdAt and updatedAt are automatically added by Sequelize
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'User', // We need to choose the model name (will be table name 'Users')
  tableName: 'users', // Explicitly define the table name
  timestamps: true, // Enable timestamps (createdAt, updatedAt)
});

module.exports = User; 