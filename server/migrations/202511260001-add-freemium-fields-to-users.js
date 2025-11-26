'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add freemium / subscription fields to existing users table
    await queryInterface.addColumn('users', 'apiUsageCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('users', 'subscriptionStatus', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'free',
    });

    await queryInterface.addColumn('users', 'subscriptionExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'subscriptionPlanId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    // Remove freemium / subscription fields
    await queryInterface.removeColumn('users', 'apiUsageCount');
    await queryInterface.removeColumn('users', 'subscriptionStatus');
    await queryInterface.removeColumn('users', 'subscriptionExpiresAt');
    await queryInterface.removeColumn('users', 'subscriptionPlanId');
  }
};


