/**
 * webScraper.js (versión estable + compatibilidad total)
 */

const puppeteer = require("puppeteer");
const socialScraper = require("./socialScraper");

// scraper/webScraper.js

const SCRAPE_ERRORS = {
  FRAME_DETACHED: 'FRAME_DETACHED',
  TIMEOUT: 'TIMEOUT',
  NAVIGATION_ERROR: 'NAVIGATION_ERROR',
  ANTI_BOT: 'ANTI_BOT',
  UNKNOWN: 'UNKNOWN'
};

function classifyScrapeError(error) {
  const msg = error.message?.toLowerCase() || '';

  if (msg.includes('detached frame')) {
    return SCRAPE_ERRORS.FRAME_DETACHED;
  }

  if (msg.includes('timeout')) {
    return SCRAPE_ERRORS.TIMEOUT;
  }

  if (msg.includes('net::err') || msg.includes('navigation')) {
    return SCRAPE_ERRORS.NAVIGATION_ERROR;
  }

  if (
    msg.includes('captcha') ||
    msg.includes('cloudflare') ||
    msg.includes('access denied')
  ) {
    return SCRAPE_ERRORS.ANTI_BOT;
  }

  return SCRAPE_ERRORS.UNKNOWN;
}


async function webScraper(url) {
  let browser;

  // Estado por defecto
  let blocked = false;
  let blockReason = null;

  try {
    // Validar URL
    try {
      new URL(url);
    } catch {
      return { error: "Invalid URL" };
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ],
    });


    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    });

    console.log(`🌐 Scraping website: ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    const bodyText = await page.evaluate(() => document.body?.innerText || "");
    const htmlSize = bodyText.replace(/\s+/g, "").length;

    let observable = "none";
    let observableScore = 0;

    if (htmlSize >= 50) {
      observable = "low";
      observableScore = 0.25;
    }

    if (htmlSize >= 200) {
      observable = "medium";
      observableScore = 0.6;
    }

    if (htmlSize >= 800) {
      observable = "high";
      observableScore = 1;
    }


    // Detectar bloqueo probable
    if (observable === "none" && htmlSize < 50) {
      blocked = true;
      blockReason = SCRAPE_ERRORS.ANTI_BOT;
    }


    let title = "";
    let description = "";
    let ogImage = "";

    if (observable !== "none") {
      title = await page.title();
      description = await page.$eval("meta[name='description']", el => el.content).catch(() => "");
      ogImage = await page.$eval("meta[property='og:image']", el => el.content).catch(() => "");
    }

    const allLinks = observable !== "none"
      ? await page.$$eval("a", links => links.map(l => l.href.trim()).filter(Boolean))
      : [];

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

    const socialLinks = [...new Set(
      cleanLinks.filter(link => socialDomains.some(d => link.includes(d)))
    )];

    let socialData = {};
    if (socialLinks.length > 0) {
      socialData = await socialScraper(socialLinks, browser);
    }

    await browser.close();

    return {
      url,
      observable,        // "none" | "low" | "medium" | "high"
      observableScore,   // 0 → 1
      blocked,
      blockReason,
      title,
      description,
      ogImage,
      socialLinks,
      socialData,
    };


  } catch (error) {
    if (browser) await browser.close();

    const errorType = classifyScrapeError(error);

    console.error("❌ Error scraping website:", {
      type: errorType,
      message: error.message
    });

    return {
      url,
      observable: "none",
      observableScore: 0,
      blocked: errorType === SCRAPE_ERRORS.ANTI_BOT,
      blockReason: errorType === SCRAPE_ERRORS.ANTI_BOT ? errorType : null,
      error: errorType,
      message: error.message
    };


  }
}


module.exports = webScraper;
