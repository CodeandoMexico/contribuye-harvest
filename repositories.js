const fs = require('fs');

const repositories = JSON.parse(fs.readFileSync('./repositories.json', 'utf8'))
  .repositories;

module.exports = repositories;



