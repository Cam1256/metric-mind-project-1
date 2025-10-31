const puppeteer = require("puppeteer");

async function scrapWebsite(url) {
  let browser;
  try {
    console.log(`🔍 Launching Puppeteer to scrape: ${url}`);

    // Configuración optimizada para VPS (sin GUI)
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process"
      ]
    });

    const page = await browser.newPage();

    // Simula un navegador real
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/120.0.0.0 Safari/537.36"
    );

    await page.setViewport({ width: 1366, height: 768 });

    // Timeout de carga de página
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45000
    });

    // Espera un poco para asegurar carga de JS dinámico
    await page.waitForTimeout(3000);

    // Extrae datos básicos
    const title = await page.title();
    const description = await page.$eval(
      "meta[name='description']",
      el => el.content
    ).catch(() => "");

    const ogImage = await page.$eval(
      "meta[property='og:image']",
      el => el.content
    ).catch(() => "");

    // Extrae los links a redes sociales (si los hay)
    const socialLinks = await page.$$eval("a[href]", links =>
      links
        .map(a => a.href)
        .filter(h =>
          /(facebook|twitter|instagram|linkedin|youtube|tiktok)/i.test(h)
        )
    );

    // Retorna resultado
    return {
      url,
      title,
      description,
      ogImage,
      socialLinks,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error("❌ Error during Puppeteer scrape:", err.message);
    return { error: "Scraping failed", details: err.message };
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = scrapWebsite;
