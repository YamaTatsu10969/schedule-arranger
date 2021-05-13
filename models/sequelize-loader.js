'use strict';
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  database:
    process.env.DATABASE_URL ||
    'postgres://postgres:postgres@db/schedule_arranger',
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

module.exports = {
  sequelize,
  DataTypes,
};
