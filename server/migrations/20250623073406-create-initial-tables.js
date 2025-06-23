'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Users table
    await queryInterface.createTable('users', {
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      userName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      avatarUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verificationCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verificationCodeExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      refreshToken: {
        type: Sequelize.STRING(512),
        allowNull: true,
      },
      refreshTokenExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create TranscriptionRecords table
    await queryInterface.createTable('TranscriptionRecords', {
      transactionId: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // table name
          key: 'userId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      recordingDuration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      wordCount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('success', 'failed'),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TranscriptionRecords');

    await queryInterface.dropTable('users');
  }
};
