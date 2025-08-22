const { initializeDB, getDB } = require('./src/db');
const { defineModel, getModel } = require('./src/models');

function getModuleVersion(){
	return 'Database Manager - 1.0.1 ---------------------- Sad4k 2025'
}
module.exports = {getModuleVersion, initializeDB, getDB, defineModel, getModel, getSequelize: getDB };
