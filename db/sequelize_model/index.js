'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const config = require('../../config');
const baseName = path.basename(__filename);
const { dotCaseToCamelCase } = require('../../libs/util');

const sequelize = new Sequelize(config.sequelize);
const db = { sequelize };

function importFile(file, dir) {
  let fullPath = __dirname;

  if (file) {
    if (dir) {
      fullPath = path.join(__dirname, dir, file);
    } else {
      fullPath = path.join(__dirname, file);
    }
  }

  const stats = fs.statSync(fullPath);

  if (stats.isDirectory()) {
    const d = dir ? `${dir}/${file}` : file;
    return fs.readdirSync(fullPath).forEach(f => importFile(f, d));
  }

  if (path.extname(file) === '.js' && file !== baseName) {
    const r = require(fullPath); // eslint-disable-line global-require

    if (r) {
      let name = path.basename(file, '.js');
      name = dir ? path.join(dir, name) : name;
      name = name.replace(/\//g, '.');

      const model = sequelize.import(fullPath, r);
      db[dotCaseToCamelCase(name)] = model;
    }
  }
}

importFile();

module.exports = db;
