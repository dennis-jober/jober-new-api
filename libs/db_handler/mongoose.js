'use strict';

const errors = require('../errors');

module.exports = Model => ({
  async get(query, projection) {
    try {
      return await Model.findOne(query, projection);
    } catch (err) {
      err.tableName = Model.modelName;
      throw new errors.DbError(null, err);
    }
  },

  async query(query, projection) {
    try {
      return await Model.find(query, projection);
    } catch (err) {
      err.tableName = Model.modelName;
      throw new errors.DbError(null, err);
    }
  },

  async count(query) {
    try {
      return await Model.count(query);
    } catch (err) {
      err.tableName = Model.modelName;
      throw new errors.DbError(null, err);
    }
  },

  async put(...item) {
    const { length } = item;
    if (!length) throw new Error('no item');

    try {
      if (length === 1) {
        [item] = item;
        if (Array.isArray(item)) {
          if (!item.length) throw new errors.InternalError('invalid parameter');

          const parallelList = [];
          item.forEach((i) => {
            const data = new Model(i);
            parallelList.push(data.save());
          });

          await Promise.all(parallelList);
        } else {
          const data = new Model(item);
          await data.save();
        }
      } else {
        const data = new Model(item);
        await data.save();
      }
    } catch (err) {
      if (err.name === 'InternalError') throw err;

      err.tableName = Model.modelName;
      throw new errors.DbError(null, err);
    }
  },

  async updateOne(query, value, upsert = false) {
    if (!value || typeof (value) !== 'object' || Array.isArray(value)) {
      throw new Error('invalid parameter');
    }

    try {
      await Model.updateOne(query, value, { upsert });
    } catch (err) {
      err.tableName = Model.modelName;
      throw new errors.DbError(null, err);
    }
  },

  async update(query, value, upsert = false) {
    if (!value || typeof (value) !== 'object' || Array.isArray(value)) {
      throw new Error('invalid parameter');
    }

    try {
      await Model.updateMany(query, value, { upsert });
    } catch (err) {
      err.tableName = Model.modelName;
      throw new errors.DbError(null, err);
    }
  },

  async deleteOne(query) {
    try {
      await Model.deleteOne(query);
    } catch (err) {
      err.tableName = Model.modelName;
      throw new errors.DbError(null, err);
    }
  },

  async delete(query) {
    try {
      await Model.deleteMany(query);
    } catch (err) {
      err.tableName = Model.modelName;
      throw new errors.DbError(null, err);
    }
  },

  async truncate() {
    try {
      await Model.collection.drop();
    } catch (err) {
      err.tableName = Model.modelName;
      throw new errors.DbError(null, err);
    }
  },
});
