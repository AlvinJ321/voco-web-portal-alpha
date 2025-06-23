const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.resolve(__dirname, '../voco_app.sqlite'),
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'mysql',
    dialectModule: require('mysql2')
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false
    //   }
    // }
  }
};
