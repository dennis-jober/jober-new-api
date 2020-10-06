'use strict';

const { createClient } = require('redis');
const { promisify } = require('util');

const errors = require('../errors');
const logger = require('../logger');

function convertToObject(value) {
  if (Array.isArray(value)) {
    value = value.map((v) => {
      try {
        return JSON.parse(v);
      } catch (err) {
        return v;
      }
    });

    return value;
  }

  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
}

function convertObjectToJson(items) {
  const { length } = items;
  for (let i = 0; i < length; i += 1) {
    if (i % 2 && typeof items[i] === 'object') items[i] = JSON.stringify(items[i]);
  }
}

module.exports = (endPoint) => {
  const client = createClient(
    6379,
    endPoint,
    { no_ready_check: true },
  );

  client.on('error', (err) => {
    if (process.env.NODE_ENV !== 'production') logger.error(err);
  });

  const getAsync = promisify(client.get).bind(client);
  const mgetAsync = promisify(client.mget).bind(client);
  const setAsync = promisify(client.set).bind(client);
  const msetAsync = promisify(client.mset).bind(client);
  const incrbyAsync = promisify(client.incrby).bind(client);
  const expireAsync = promisify(client.expire).bind(client);

  const saddAsync = promisify(client.sadd).bind(client);
  const sismemberAsync = promisify(client.sismember).bind(client);

  const hgetAsync = promisify(client.hget).bind(client);
  const hmgetAsync = promisify(client.hmget).bind(client);
  const hgetallAsync = promisify(client.hgetall).bind(client);
  const hsetAsync = promisify(client.hset).bind(client);
  const hmsetAsync = promisify(client.hmset).bind(client);
  const hincrbyAsync = promisify(client.hincrby).bind(client);
  const hdelAsync = promisify(client.hdel).bind(client);

  return ({
    async get(...key) {
      const { length } = key;
      let value;

      if (length === 0) throw new Error('no key');

      try {
        if (length === 1) {
          [key] = key;
          if (Array.isArray(key)) {
            value = await mgetAsync(...key);
          } else if (typeof key === 'object') {
            throw new errors.InternalError('invalid parameter');
          } else {
            value = await getAsync(key);
          }
        } else {
          value = await mgetAsync(...key);
        }
      } catch (err) {
        if (err.name === 'InternalError') throw err;
        throw new errors.RedisError(null, err);
      }

      return convertToObject(value);
    },

    async set(...item) {
      const { length } = item;
      let result;

      if (length === 0) throw new Error('no item');

      try {
        if (length === 1) {
          [item] = item;
          if (Array.isArray(item)) {
            convertObjectToJson(item);
            if (item.length < 2) throw new errors.InternalError('invalid parameter');
            else if (item.length === 2) result = await setAsync(...item);
            else result = await msetAsync(...item);
          } else if (typeof item === 'object') {
            item = Object.entries(item).reduce((a, b) => a.concat(b), []);
            if (item.length < 2) throw new errors.InternalError('invalid parameter');
            else if (item.length === 2) result = await setAsync(...item);
            else result = await msetAsync(...item);
          } else {
            throw new errors.InternalError('invalid parameter');
          }
        } else {
          convertObjectToJson(item);
          if (length === 2) result = await setAsync(...item);
          else result = await msetAsync(...item);
        }
      } catch (err) {
        if (err.name === 'InternalError') throw err;
        throw new errors.RedisError(null, err);
      }

      return result;
    },

    async setAndExpire(key, value, expiry) {
      if (!value) throw new Error('no value');

      if (!expiry) expiry = 600;
      if (typeof value === 'object') value = JSON.stringify(value);

      try {
        return await setAsync(key, value, 'EX', expiry);
      } catch (err) {
        throw new errors.RedisError(null, err);
      }
    },

    async incrby(key, value) {
      if (!value || isNaN(value)) throw new Error('invalid parameter');

      try {
        return await incrbyAsync(key, value);
      } catch (err) {
        throw new errors.RedisError(null, err);
      }
    },

    async expire(key, expiry) {
      if (!expiry && !(expiry === 0)) expiry = 600;

      try {
        return await expireAsync(key, expiry);
      } catch (err) {
        throw new errors.RedisError(null, err);
      }
    },

    async hget(key, ...hashKey) {
      const { length } = hashKey;
      let value;

      if (length === 0) throw new Error('no hashkey');

      try {
        if (length === 1) {
          [hashKey] = hashKey;
          if (Array.isArray(hashKey)) {
            value = await hmgetAsync(key, ...hashKey);
          } else if (typeof hashKey === 'object') {
            throw new errors.InternalError('invalid parameter');
          } else {
            value = await hgetAsync(key, hashKey);
          }
        } else {
          value = await hmgetAsync(key, ...hashKey);
        }
      } catch (err) {
        if (err.name === 'InternalError') throw err;
        throw new errors.RedisError(null, err);
      }

      return convertToObject(value);
    },

    async hgetall(key) {
      try {
        return convertToObject(await hgetallAsync(key));
      } catch (err) {
        throw new errors.RedisError(null, err);
      }
    },

    async hset(key, ...item) {
      const { length } = item;
      let result;

      if (length === 0) throw new Error('no item');

      try {
        if (length === 1) {
          [item] = item;
          if (Array.isArray(item)) {
            convertObjectToJson(item);
            if (item.length < 2) throw new errors.InternalError('invalid parameter');
            else if (item.length === 2) result = await hsetAsync(key, ...item);
            else result = await hmsetAsync(key, ...item);
          } else if (typeof item === 'object') {
            item = Object.entries(item).reduce((a, b) => a.concat(b), []);
            result = await hmsetAsync(key, ...item);
            if (item.length < 2) throw new errors.InternalError('invalid parameter');
            else if (item.length === 2) result = await hsetAsync(key, ...item);
            else result = await hmsetAsync(key, ...item);
          } else {
            result = await hmsetAsync(key, item);
          }
        } else {
          convertObjectToJson(item);
          if (length === 2) result = await hsetAsync(key, ...item);
          else result = await hmsetAsync(key, ...item);
        }
      } catch (err) {
        if (err.name === 'InternalError') throw err;
        throw new errors.RedisError(null, err);
      }

      return result;
    },

    async hincrby(key, hashKey, value) {
      if (!value || isNaN(value)) throw new Error('invalid parameter');

      try {
        return await hincrbyAsync(key, hashKey, value);
      } catch (err) {
        throw new errors.RedisError(null, err);
      }
    },

    async hdel(key, hashKey) {
      try {
        return await hdelAsync(key, hashKey);
      } catch (err) {
        throw new errors.RedisError(null, err);
      }
    },

    async sadd(key, value) {
      if (!value) throw new Error('invalid parameter');

      try {
        return await saddAsync(key, value);
      } catch (err) {
        throw new errors.RedisError(null, err);
      }
    },

    async sismember(key, value) {
      if (!value) throw new Error('invalid parameter');

      try {
        const member = await sismemberAsync(key, value);
        return Number(member);
      } catch (err) {
        throw new errors.RedisError(null, err);
      }
    },
  });
};
