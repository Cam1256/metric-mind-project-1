// db/integrations.js
const { dynamo } = require("../config/aws");

const TABLE_NAME = "MetricMindUserIntegrations";

/**
 * Guarda o actualiza la integración Facebook / Instagram
 */
async function saveFacebookIntegration({
  userSub,          // Cognito sub (string)
  facebookData,     // objeto con tokens y ids
  instagramData,    // objeto con ig business id (opcional)
}) {
  if (!userSub) {
    throw new Error("userSub is required");
  }

  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userSub}`,
      SK: "INTEGRATION#META",
    },
    UpdateExpression: `
      SET 
        facebook = :facebook,
        instagram = :instagram,
        integrationsStatus.facebook = :fbStatus,
        integrationsStatus.instagram = :igStatus,
        updatedAt = :updatedAt
    `,
    ExpressionAttributeValues: {
      ":facebook": facebookData || null,
      ":instagram": instagramData || null,
      ":fbStatus": !!facebookData,
      ":igStatus": !!instagramData,
      ":updatedAt": new Date().toISOString(),
    },
    ReturnValues: "ALL_NEW",
  };

  return dynamo.update(params).promise();
}

/**
 * Obtiene el estado de integraciones del usuario
 */
async function getIntegrationsStatus(userSub) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${userSub}`,
      SK: "INTEGRATION#META",
    },
  };

  const res = await dynamo.get(params).promise();

  if (!res.Item) {
    return {
      facebook: false,
      instagram: false,
      linkedin: false,
      tiktok: false,
    };
  }

  return res.Item.integrationsStatus || {};
}

module.exports = {
  saveFacebookIntegration,
  getIntegrationsStatus,
};
