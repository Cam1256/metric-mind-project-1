const webScraper = require("./scraper/webScraper"); // tu scraper real
const { mapScraperResultToSignals } = require("./domain/signals/scraperSignalMapper");
const { analyzeSignals } = require("./domain/signals/signalAnalysis");

// Cambia esta URL por la página que quieras probar
const urlToTest = "https://www.procuraduria.gov.co/";



async function testLiveScraper(url) {
  try {
    // 1️⃣ Scrapeamos la página completa
    const scrapingResult = await webScraper(url);

    console.log("📄 Scraping Result:");
    console.log(scrapingResult);

    // 2️⃣ Convertimos a signals
    const signals = mapScraperResultToSignals(scrapingResult);

    console.log("\n🧩 Signals:");
    console.log(signals);

    // 3️⃣ Analizamos los signals
    const analysis = analyzeSignals(signals);

    console.log("\n🧪 Analysis:");
    console.log(analysis);

  } catch (err) {
    console.error("❌ Error al probar scraper:", err);
  }
}

// Ejecutar
testLiveScraper(urlToTest);
