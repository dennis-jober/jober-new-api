'use strict';

const { MongoClient } = require('mongodb');

const errors = require('../errors');
const logger = require('../logger');

module.exports = (endPoint, database) => {
  const client = new MongoClient(endPoint, { useNewUrlParser: true, useUnifiedTopology: true });

  client.connect((err) => {
    if (err) {
      logger.error(err);
    }
  });

  const db = client.db(database);

  return ({
    get: async (collection, query, projection) => {
      try {
        return db.collection(collection).findOne(query, projection);
      } catch (err) {
        err.tableName = collection;
        throw new errors.DbError(null, err);
      }
    },

    query: async (collection, query, projection) => {
      try {
        return db.collection(collection).find(query, projection);
      } catch (err) {
        err.tableName = collection;
        throw new errors.DbError(null, err);
      }
    },

    put: async (collection, ...item) => {
      const { length } = item;
      if (!length) throw new Error('no item');

      try {
        const c = db.collection(collection);

        if (length === 1) {
          [item] = item;
          if (Array.isArray(item)) {
            if (!item.length) throw new errors.InternalError('invalid parameter');

            await c.insertMany(item);
          } else {
            await c.insertOne(item);
          }
        } else {
          await c.insertMany(item);
        }
      } catch (err) {
        if (err.name === 'InternalError') throw err;

        err.tableName = collection;
        throw new errors.DbError(null, err);
      }
    },

    updateOne: async (collection, query, value, upsert = false) => {
      try {
        await db.collection(collection).updateOne(query, value, { upsert });
      } catch (err) {
        err.tableName = collection;
        throw new errors.DbError(null, err);
      }
    },

    update: async (collection, query, value, upsert = false) => {
      try {
        await db.collection(collection).updateMany(query, value, { upsert });
      } catch (err) {
        err.tableName = collection;
        throw new errors.DbError(null, err);
      }
    },

    deleteOne: async (collection, query) => {
      try {
        await db.collection(collection).deleteOne(query);
      } catch (err) {
        err.tableName = collection;
        throw new errors.DbError(null, err);
      }
    },

    delete: async (collection, query) => {
      try {
        await db.collection(collection).deleteMany(query);
      } catch (err) {
        err.tableName = collection;
        throw new errors.DbError(null, err);
      }
    },

    truncate: async (collection) => {
      try {
        await db.collection(collection).drop();
      } catch (err) {
        err.tableName = collection;
        throw new errors.DbError(null, err);
      }
    },
  });
};
