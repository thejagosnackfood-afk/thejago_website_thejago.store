const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;
const connectMySQL = async () => {
  if (!process.env.MYSQL_DATABASE) {
    console.warn('⚠️ Missing MYSQL_DATABASE in environment. MySQL connection skipped.');
    return;
  }
  
  try {
    sequelize = new Sequelize(
      process.env.MYSQL_DATABASE,
      process.env.MYSQL_USER,
      process.env.MYSQL_PASSWORD,
      {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        dialect: 'mysql',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
    await sequelize.authenticate();
    console.log('✅ Connected to cPanel MySQL Database');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error);
  }
};

module.exports = { sequelize, connectMySQL };
