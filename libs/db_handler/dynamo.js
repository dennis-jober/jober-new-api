'use strict';

const { doc } = require('../aws');
const errors = require('../errors');

async function batchGet(TableName, Keys) {
  return doc.batchGet({
    RequestItems: {
      [TableName]: { Keys },
    },
  }).promise();
}

async function batchWrite(TableName, Items) {
  const params = Items.map(i => ({
    PutRequest: {
      Item: i,
    },
  }));

  await doc.batchWrite({
    RequestItems: {
      [TableName]: params,
    },
  }).promise();
}

module.exports = TableName => ({
  get: async (params, ...Key) => {
    if (!Key.length) {
      if (!params) throw new Error('no item');

      Key = [params];
      params = undefined;
    }

    const { length } = Key;

    try {
      if (length === 1) {
        [Key] = Key;
        if (Array.isArray(Key)) {
          if (!Key.length) throw new errors.InternalError('invalid parameter');
          return await batchGet(TableName, Key);
        }

        params = {
          TableName,
          Key,
          ...(params || {}),
        };

        const data = await doc.get(params).promise();
        return data.Item;
      }

      return await batchGet(TableName, Key);
    } catch (err) {
      if (err.name === 'InternalError') throw err;

      err.tableName = TableName;
      throw new errors.DbError(null, err);
    }
  },

  query: async (
    KeyConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues, params,
  ) => {
    const newParams = {
      TableName,
      KeyConditionExpression,
      ExpressionAttributeValues,
      ...(params || {}),
    };

    try {
      const data = await doc.query(newParams).promise();

      if (data.LastEvaluatedKey) {
        const nextParams = {
          ...params,
          ExclusiveStartKey: data.LastEvaluatedKey,
        };

        data.Items.next = async () => this.query(
          KeyConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues, nextParams,
        );
      }

      if (data && data.Items && data.Items.length) return data.Items;
      return [];
    } catch (err) {
      err.tableName = TableName;
      throw new errors.DbError(null, err);
    }
  },

  queryLimit: async (
    KeyConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues, params, limit,
  ) => {
    let list = [];

    let items = await this.query(
      KeyConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues, params,
    );

    if (limit && items.length >= limit) return items.slice(0, limit);

    list = list.concat(items);
    while (items.next) {
      items = await items.next();
      list = list.concat(items);

      if (limit && list.length >= limit) return list.slice(0, limit);
    }

    return list;
  },

  queryAll: async (
    KeyConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues, params,
  ) => this.queryLimit(
    KeyConditionExpression, ExpressionAttributeNames, ExpressionAttributeValues, params, 0,
  ),

  count: () => {
    throw new Error('unsupported');
  },

  put: async (...Item) => {
    const { length } = Item;
    if (!length) throw new Error('no item');

    try {
      if (length === 1) {
        [Item] = Item;
        if (Array.isArray(Item)) {
          if (!Item.length) throw new errors.InternalError('invalid parameter');
          await batchWrite(TableName, Item);
        } else {
          await doc.put({ TableName, Item }).promise();
        }
      } else {
        await batchWrite(TableName, Item);
      }
    } catch (err) {
      if (err.name === 'InternalError') throw err;

      err.tableName = TableName;
      throw new errors.DbError(null, err);
    }
  },

  set: async (Key, value, increasingFields) => {
    if (!value || typeof (value) !== 'object' || Array.isArray(value)) {
      throw new Error('invalid parameter');
    }

    const updatedFields = Object.keys(value);
    const AttributeUpdates = {};

    updatedFields.forEach((uf) => {
      const Value = value[uf];

      if (Value === undefined || Value === null || Value === '') {
        AttributeUpdates[uf] = { Action: 'DELETE' };
        return;
      }

      if (increasingFields.indexOf(uf) < 0) {
        AttributeUpdates[uf] = { Action: 'PUT', Value };
      } else {
        AttributeUpdates[uf] = { Action: 'ADD', Value };
      }
    });

    try {
      await doc.update({
        TableName,
        Key,
        AttributeUpdates,
      }).promise();
    } catch (err) {
      err.tableName = TableName;
      throw new errors.DbError(null, err);
    }
  },

  increase: async (Key, value) => {
    if (!value || typeof (value) !== 'object' || Array.isArray(value)) {
      throw new Error('invalid parameter');
    }

    return this.update(Key, value, Object.keys(value));
  },

  delete: async (Key) => {
    try {
      await doc.delete({
        TableName,
        Key,
      }).promise();
    } catch (err) {
      err.tableName = TableName;
      throw new errors.DbError(null, err);
    }
  },

  async trucate() {
    throw new Error('unsupported');
  },
});
