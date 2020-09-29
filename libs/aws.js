'use strict';

const AWS = require('aws-sdk');
const https = require('https');

const config = require('../config');

if (process.env.NODE_ENV === 'develop') {
  const options = {
    endpoint: 'http://localhost:8000',
    region: 'ap-northeast-1',
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  };

  exports.ddb = new AWS.DynamoDB(options);
  exports.doc = new AWS.DynamoDB.DocumentClient(options);
} else {
  const agent = new https.Agent({
    maxSocket: 256,
    keepAlive: true,
    rejectUnauthorized: true,
  });

  AWS.config.update({
    region: config.aws.region,
    httpOptions: { agent },
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  });

  exports.ddb = new AWS.DynamoDB();
  exports.doc = new AWS.DynamoDB.DocumentClient();
  exports.s3 = new AWS.S3({
    signatureVersion: 'v4',
    region: config.aws.region,
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  });

  exports.cloudfront = new AWS.CloudFront();

  exports.sns = new AWS.SNS();
  exports.ses = new AWS.SES({
    region: 'us-east-1', // 서울 지역은 서비스 불가.
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  });
}
