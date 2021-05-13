'use strict';
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE_URL ||
    'postgres://postgres:postgres@db/schedule_arranger',
);
// const sequelize = new Sequelize(
//   process.env.DATABASE_URL ||
//     'postgres://postgres:postgres@db/schedule_arranger',
//   'postgres',
//   'postgres',
//   {
//     dialect: 'postgres',
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false,
//       },
//     },
//   },
// );

module.exports = {
  sequelize,
  DataTypes,
};
