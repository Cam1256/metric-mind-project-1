/**
 * webScraper.js (versión estable + compatibilidad total)
 */

const puppeteer = require("puppeteer");
const socialScraper = require("./socialScraper");

async function webScraper(url) {
  let browser;
  try {
    // Validar URL antes de lanzar Puppeteer
    try {
      new URL(url);
    } catch {
      console.error(`❌ Invalid URL skipped: ${url}`);
      return { error: "Invalid URL" };
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process"
      ],
    });

    const page = await browser.newPage();

    // Cabeceras avanzadas (anti-bot)
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Upgrade-Insecure-Requests": "1",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    });

    console.log(`🌐 Scraping website: ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });

    // Espera ligera (JS dinámico)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Metadatos
    const title = await page.title();
    const description = await page.$eval("meta[name='description']", el => el.content).catch(() => "");
    const ogImage = await page.$eval("meta[property='og:image']", el => el.content).catch(() => "");

    // Enlaces sociales
    const allLinks = await page.$$eval("a", links => links.map(l => l.href.trim()).filter(Boolean));
    const baseUrl = new URL(url).origin;

    const cleanLinks = allLinks.map(link => {
      if (link.startsWith("//")) return "https:" + link;
      if (link.startsWith("/")) return baseUrl + link;
      return link;
    });

    const socialDomains = [
      "facebook.com",
      "instagram.com",
      "twitter.com",
      "x.com",
      "tiktok.com",
      "linkedin.com",
      "youtube.com",
      "youtu.be",
    ];

    const socialLinks = [...new Set(cleanLinks.filter(link => socialDomains.some(domain => link.includes(domain))))];

    console.log(`🔗 Found ${socialLinks.length} social media links`);

    let socialData = {};
    if (socialLinks.length > 0) {
      console.log("🕵️ Fetching details from social profiles...");
      socialData = await socialScraper(socialLinks, browser);
    }

    await browser.close();

    return {
      url,
      title,
      description,
      ogImage,
      socialLinks,
      socialData,
    };
  } catch (error) {
    if (browser) await browser.close();
    console.error("❌ Error scraping website:", error);
    return {
      error: "Failed to scrape the website.",
      details: error.message,
      stack: error.stack,
    };
  }
}

module.exports = webScraper;
