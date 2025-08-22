const { DataTypes } = require('sequelize');
const { getDB } = require('./db');

const models = {};

/**
 * Define un modelo de base de datos dinámicamente.
 * @param {string} name - Nombre del modelo.
 * @param {Object} schema - Esquema del modelo (campos y tipos).
 */
const defineModel = (name, schema) => {
  const sequelize = getDB();
  models[name] = sequelize.define(name, schema, { timestamps: false });
  return models[name];
};

/**
 * Obtener un modelo previamente definido.
 * @param {string} name - Nombre del modelo.
 */
const getModel = (name) => {
  if (!models[name]) {
    throw new Error(`Modelo "${name}" no encontrado.`);
  }
  return models[name];
};

module.exports = { defineModel, getModel ,getSequelize: getDB};
