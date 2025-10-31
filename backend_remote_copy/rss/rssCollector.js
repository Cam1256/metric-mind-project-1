/**
 * rssCollector.js
 * --------------------------------------------------
 * Busca automáticamente feeds RSS desde un dominio ingresado
 * por el usuario, los analiza y guarda sus artículos.
 */

const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");
const axios = require("axios");
const parser = new Parser();

const storagePath = path.join(__dirname, "../db/rssStorage.json");

/**
 * Carga archivo JSON o devuelve objeto vacío
 */
function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

/**
 * Guarda archivo JSON con formato legible
 */
function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Intenta detectar automáticamente URLs RSS comunes
 */
async function detectRSSFeeds(domain) {
  const possiblePaths = [
    "/feed",
    "/rss",
    "/rss.xml",
    "/atom.xml",
    "/feeds/posts/default",
  ];

  const foundFeeds = [];

  for (const pathSuffix of possiblePaths) {
    const testUrl = new URL(pathSuffix, domain).href;
    try {
      const res = await axios.head(testUrl, { timeout: 5000 });
      if (res.headers["content-type"]?.includes("xml") || res.status === 200) {
        foundFeeds.push(testUrl);
      }
    } catch {
      // ignoramos errores 404, timeouts, etc.
    }
  }

  return foundFeeds;
}

/**
 * Recolecta artículos RSS automáticamente
 * @param {string} domain - dominio ingresado por el usuario
 * @returns {Promise<Array>} artículos encontrados
 */
async function collectRSS(domain) {
  console.log(`🔍 Buscando RSS feeds en ${domain}`);

  const feeds = await detectRSSFeeds(domain);

  if (feeds.length === 0) {
    console.log(`⚠️ No se encontraron feeds RSS en ${domain}`);
    return [];
  }

  const allArticles = [];

  for (const feedUrl of feeds) {
    try {
      console.log(`📡 Analizando feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      feed.items.forEach(item => {
        allArticles.push({
          title: item.title,
          link: item.link,
          published: item.pubDate,
          summary: item.contentSnippet || item.summary || "",
          source: feedUrl,
        });
      });
    } catch (err) {
      console.error(`❌ Error procesando ${feedUrl}:`, err.message);
    }
  }

  // Guardar en rssStorage.json
  const storage = loadJSON(storagePath);
  storage.lastUpdated = new Date().toISOString();
  storage.articles = storage.articles || {};
  storage.articles[domain] = allArticles;
  saveJSON(storagePath, storage);

  console.log(`✅ RSS actualizado para ${domain} (${allArticles.length} artículos)`);
  return allArticles;
}

module.exports = { collectRSS };
