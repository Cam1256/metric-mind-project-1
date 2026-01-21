const AWS = require("aws-sdk");

// Usa la región por defecto o la definida en tu entorno
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1",
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "MetricMindUserIntegrations";

/**
 * Guarda o actualiza una integración del usuario
 */
async function saveIntegration({ pk, sk, data }) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      PK: pk,
      SK: sk,
      ...data,
      updatedAt: new Date().toISOString(),
    },
  };

  return dynamoDB.put(params).promise();
}

/**
 * Obtiene las integraciones de un usuario
 */
async function getUserIntegrations(pk) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: {
      ":pk": pk,
    },
  };

  const result = await dynamoDB.query(params).promise();
  return result.Items || [];
}

module.exports = {
  saveIntegration,
  getUserIntegrations,
};
