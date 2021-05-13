'use strict';
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE_URL ||
    'postgres://postgres:postgres@db/schedule_arranger',
);

module.exports = {
  sequelize,
  DataTypes,
};
