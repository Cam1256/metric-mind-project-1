const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "metricmind",
  password: "12345678",
  port: 5432,
});

async function saveMemory(entry) {
  const query = `
    INSERT INTO memory_entries
    (organization_id, department, level, type, key, value, confidence, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
  `;

  await pool.query(query, [
    entry.organization_id,
    entry.department,
    entry.level,
    entry.type,
    entry.key,
    entry.value,
    entry.confidence,
    entry.metadata || {},
  ]);
}

async function getMemory(organization_id, department) {
  const result = await pool.query(
    `SELECT * FROM memory_entries
     WHERE organization_id=$1 AND department=$2
     ORDER BY confidence DESC
     LIMIT 10`,
    [organization_id, department]
  );

  return result.rows;
}

module.exports = { saveMemory, getMemory };