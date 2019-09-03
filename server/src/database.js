const monk = require('monk');
const database = monk(process.env.DB_URL);
module.exports = database;