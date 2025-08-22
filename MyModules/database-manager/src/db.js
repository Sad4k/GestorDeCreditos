const { Sequelize } = require('sequelize');

let sequelize = null;

/**
 * Inicializa Sequelize con la configuración proporcionada.
 * @param {Object} config - Configuración de la base de datos.
 */
const initializeDB = (config) => {

  sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: config.type,  
    storage: config.path || undefined,  
    logging: false,  
  });
};


const getDB = () => {
  if (!sequelize) {
    throw new Error('La base de datos no ha sido inicializada. Llama a initializeDB(config) primero.');
  }
  return sequelize;
};

module.exports = { initializeDB, getDB };
