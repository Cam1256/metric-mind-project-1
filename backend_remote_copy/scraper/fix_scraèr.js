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
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
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

    const MIN_CONTENT_THRESHOLD = 200;
    const isObservable = htmlSize >= MIN_CONTENT_THRESHOLD;

    // Detectar bloqueo probable
    if (!isObservable && htmlSize < 50) {
      blocked = true;
      blockReason = SCRAPE_ERRORS.ANTI_BOT;
    }

    let title = "";
    let description = "";
    let ogImage = "";

    if (isObservable) {
      title = await page.title();
      description = await page.$eval("meta[name='description']", el => el.content).catch(() => "");
      ogImage = await page.$eval("meta[property='og:image']", el => el.content).catch(() => "");
    }

    const allLinks = isObservable
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
      observable: isObservable,
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
      observable: false,
      blocked: errorType === SCRAPE_ERRORS.ANTI_BOT,
      blockReason: errorType === SCRAPE_ERRORS.ANTI_BOT ? errorType : null,
      error: errorType,
      message: error.message
    };
  }
}


module.exports = webScraper;
