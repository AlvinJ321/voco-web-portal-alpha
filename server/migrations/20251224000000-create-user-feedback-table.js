'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_feedback', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: '工单唯一ID'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '关联 users 表的主键',
        references: {
          model: 'users',
          key: 'userId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      contactEmail: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      issueType: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '问题描述'
      },
      attachmentUrls: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '附件URL，JSON数组格式'
      },
      appVersion: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '应用版本号'
      },
      osVersion: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '系统版本号'
      },
      deviceModel: {
        type: Sequelize.STRING(150),
        allowNull: true,
        comment: '设备型号'
      },
      cpuArch: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '处理器架构'
      },
      systemMemory: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '系统总内存'
      },
      inputDeviceName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '输入设备名称'
      },
      inputSampleRate: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '输入采样率'
      },
      micPermissionStatus: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '麦克风权限状态'
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'pending',
        comment: '工单状态'
      },
      adminNote: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '管理员备注'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: '创建时间'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW,
        comment: '更新时间'
      }
    });

    // Create indexes
    await queryInterface.addIndex('user_feedback', ['userId'], { name: 'idx_user_feedback_userId' });
    await queryInterface.addIndex('user_feedback', ['status'], { name: 'idx_user_feedback_status' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_feedback');
  }
};
