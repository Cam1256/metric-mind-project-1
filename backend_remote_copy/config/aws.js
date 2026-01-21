// config/aws.js
const AWS = require("aws-sdk");

/**
 * Configuración global de AWS
 * Usa credenciales del entorno:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_SESSION_TOKEN (si aplica)
 * - AWS_REGION
 */
AWS.config.update({
  region: process.env.AWS_REGION,
});

const dynamo = new AWS.DynamoDB.DocumentClient({
  convertEmptyValues: true, // evita errores con strings vacíos
});

module.exports = {
  dynamo,
};
