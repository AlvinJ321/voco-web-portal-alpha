const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database'); // Import the Sequelize instance
const User = require('./User');

class UserFeedback extends Model {}

UserFeedback.init({
  // Model attributes are defined here
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    comment: '工单唯一ID'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'userId'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: '关联 users 表的主键'
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  issueType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '问题描述'
  },
  attachmentUrls: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '附件URL，JSON数组格式'
  },
  appVersion: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '应用版本号'
  },
  osVersion: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '系统版本号'
  },
  deviceModel: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: '设备型号'
  },
  cpuArch: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '处理器架构'
  },
  systemMemory: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '系统总内存'
  },
  inputDeviceName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '输入设备名称'
  },
  inputSampleRate: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '输入采样率'
  },
  micPermissionStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '麦克风权限状态'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'pending',
    comment: '工单状态'
  },
  adminNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '管理员备注'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'UserFeedback', // We need to choose the model name
  tableName: 'user_feedback', // Explicitly define the table name
  timestamps: true, // Enable timestamps (createdAt, updatedAt)
});

// Define associations
UserFeedback.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

module.exports = UserFeedback;
