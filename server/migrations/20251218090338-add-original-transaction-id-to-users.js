'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add original_transaction_id field to users table for subscription binding
    // Note: SQLite doesn't support adding UNIQUE constraint directly in addColumn
    // So we add the column first (without unique), then create a unique index
    await queryInterface.addColumn('users', 'original_transaction_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      // Don't add unique: true here for SQLite compatibility
    });

    // Add unique index for faster lookups and uniqueness constraint
    // This works for both SQLite and MySQL
    await queryInterface.addIndex('users', ['original_transaction_id'], {
      name: 'users_original_transaction_id_unique',
      unique: true,
    });
  },

  down: async (queryInterface) => {
    // Remove index first
    try {
      await queryInterface.removeIndex('users', 'users_original_transaction_id_unique');
    } catch (error) {
      // Index might not exist, continue
      console.log('Index removal skipped:', error.message);
    }
    
    // Remove original_transaction_id column
    await queryInterface.removeColumn('users', 'original_transaction_id');
  }
};

