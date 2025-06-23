const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const User = require('./User');

const TranscriptionRecord = sequelize.define('TranscriptionRecord', {
  transactionId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'userId'
    }
  },
  recordingDuration: {
    type: DataTypes.INTEGER, // Duration in seconds
    allowNull: false
  },
  wordCount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('success', 'failed'),
    allowNull: false
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

// Define the association
TranscriptionRecord.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(TranscriptionRecord, { foreignKey: 'userId' });

module.exports = TranscriptionRecord; 