'use strict';
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = !process.env.DATABASE_URL
  ? // 開発環境
    new Sequelize(
      process.env.DATABASE_URL ||
        'postgres://postgres:postgres@db/schedule_arranger',
    )
  : // Heroku 環境
    new Sequelize(
      process.env.DATABASE_URL ||
        'postgres://postgres:postgres@db/schedule_arranger',
      {
        database: 'schedule_arranger',
        username: 'postgres',
        password: 'postgres',
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      },
    );

module.exports = {
  sequelize,
  DataTypes,
};
