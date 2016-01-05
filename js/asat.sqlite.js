//===============SQLITE=================
var database = require('./libs/sqlite');
var db = new database.init();
process.mainModule.exports.db = db;
