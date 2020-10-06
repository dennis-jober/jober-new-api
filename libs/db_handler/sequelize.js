'use strict';

const errors = require('../errors');
const { isEmpty } = require('../util');

function buildReadOptions(where, {
  attributes, transaction, order, offset, limit, include,
}) {
  const options = { where };

  if (transaction) options.transaction = transaction;
  if (!isEmpty(attributes)) options.attributes = attributes;
  if (order && order.length) options.order = order;
  if (offset) options.offset = offset;
  if (limit && limit > 1) options.limit = limit;
  if (include && include.length) options.include = include;

  return options;
}

async function queryFunc(model, where, params) {
  const options = buildReadOptions(where, params);
  const { array, limit } = params;

  if (limit === 1) {
    const data = await model.findOne(options);
    if (data) {
      return array ? [data.dataValues] : data.dataValues;
    }
    return;
  }

  try {
    const data = await model.findAll(options);
    if (!data) return [];

    return data.map(l => l.dataValues);
  } catch (err) {
    err.tableName = model.name;
    throw new errors.DbError(null, err);
  }
}

function buildWriteOptions(where, { transaction, limit }) {
  const options = { where };

  if (transaction) {
    options.transaction = transaction;
  }
  if (limit) options.limit = limit;

  return options;
}

async function updateFunc(model, where, value, params) {
  const options = buildWriteOptions(where, params);
  const { increasingFields } = params;

  if (increasingFields) {
    if (!Array.isArray(increasingFields)) throw new Error('invalid parameter');

    const { sequelize } = model;
    Object.entries(value).forEach(([k, v]) => {
      if (increasingFields.indexOf(k) >= 0) {
        value[k] = sequelize.literal(`\`${k}\` + ${v}`);
      }
    });
  }

  try {
    await model.update(value, options);
  } catch (err) {
    err.tableName = model.name;
    throw new errors.DbError(null, err);
  }
}

module.exports = model => ({
  async get(where, params) {
    params = { ...(params || {}), limit: 1 };

    return queryFunc(model, where, params);
  },

  async query(where, params = {}) {
    params = { ...(params || {}), array: true };

    return queryFunc(model, where, params);
  },

  async count(where, params = {}) {
    const options = buildReadOptions(where, params);

    try {
      return await model.count(options);
    } catch (err) {
      err.tableName = model.name;
      throw new errors.DbError(null, err);
    }
  },

  async put(transaction, ...item) {
    const { length } = item;
    if (!length) throw new Error('no item');

    const options = {};
    if (transaction) {
      options.transaction = transaction;
    }

    try {
      if (Array.isArray(item)) {
        if (!item.length) throw new errors.InternalError('invalid parameter');
        else if (item.length === 1) {
          [item] = item;
          if (Array.isArray(item)) await model.bulkCreate(item, options);
          else await model.create(item, options);
        } else {
          await model.bulkCreate(item, options);
        }
      } else {
        await model.create(item, options);
      }
    } catch (err) {
      if (err.name === 'InternalError') throw err;

      err.tableName = model.name;
      throw new errors.DbError(null, err);
    }
  },

  async update(where, value, params) {
    if (!value || typeof (value) !== 'object' || Array.isArray(value)) {
      throw new Error('invalid parameter');
    }

    params = { ...(params || {}) };

    return updateFunc(model, where, value, params);
  },

  async increase(where, value, params) {
    if (!value || typeof (value) !== 'object' || Array.isArray(value)) {
      throw new Error('invalid parameter');
    }

    params = {
      ...(params || {}),
      increasingFields: Object.keys(value),
    };

    return updateFunc(model, where, value, params);
  },

  async delete(where, params) {
    const options = buildWriteOptions(where, params);

    try {
      await model.destroy(options);
    } catch (err) {
      err.tableName = model.name;
      throw new errors.DbError(null, err);
    }
  },

  async truncate() {
    try {
      await model.truncate();
    } catch (err) {
      err.tableName = model.name;
      throw new errors.DbError(null, err);
    }
  },
});
