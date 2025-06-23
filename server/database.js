const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// In production, use the DATABASE_URL. For local dev, use SQLite.
const sequelize = isProduction
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'mysql',
      dialectModule: require('mysql2'),
      dialectOptions: {
        // Add SSL options if your RDS instance requires it, 
        // which is a good practice for production.
        // ssl: {
        //   require: true,
        //   rejectUnauthorized: false 
        // }
      },
      logging: false
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: './voco_app.sqlite',
      logging: false,
    });

module.exports = sequelize; 