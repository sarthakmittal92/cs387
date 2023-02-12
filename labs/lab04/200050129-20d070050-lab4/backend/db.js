const fs = require('fs');
const Pool = require("pg").Pool

const pool = new Pool(JSON.parse(fs.readFileSync('./config.txt', {encoding:'utf8'})));

module.exports = pool;