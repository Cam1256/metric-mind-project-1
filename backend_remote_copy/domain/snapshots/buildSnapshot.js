const { mapScraperResultToSignals } = require("../signals/scraperSignalMapper");
const { analyzeSignals } = require("../signals/signalAnalysis");

function buildSnapshot({ url, scrapingResult }) {
  const signals = mapScraperResultToSignals(scrapingResult);
  const analysis = analyzeSignals(signals);

  return {
    entity: {
      type: "website",
      input: url,
      resolvedDomain: new URL(url).hostname
    },

    snapshot: {
      timestamp: new Date().toISOString(),
      observable: scrapingResult.observable ?? false,
      blocked: scrapingResult.blocked ?? false,
      blockReason: scrapingResult.blockReason ?? null
    },

    signals,

    analysis,

    raw: {
      title: scrapingResult.title,
      description: scrapingResult.description,
      socialLinks: scrapingResult.socialLinks || []
    },

    meta: {
      version: "v0",
      confidence: "low",
      notes: "Signals derived from public sources only"
    }
  };
}

module.exports = { buildSnapshot };
