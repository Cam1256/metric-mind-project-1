/**
 * webScraper.js
 * --------------------------------------------------
 * Scrapes websites with Puppeteer to extract:
 * - Title, description, OG image
 * - Social media links (Facebook, Instagram, X/Twitter, TikTok, YouTube, LinkedIn)
 * - Optionally calls socialScraper.js for deeper data
 */

const puppeteer = require("puppeteer");
const socialScraper = require("./socialScraper");

/**
 * Scrape a website and extract metadata + social links
 * @param {string} url
 * @returns {Object} Extracted data
 */
async function webScraper(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--window-size=1366,768",
      ],
    });

    const page = await browser.newPage();

    // 🧠 Simular navegador real (evitar detección anti-bot)
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/118.0.5993.88 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Ch-Ua":
        '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"macOS"',
    });

    // 🧩 Ocultar propiedades que delatan Puppeteer
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      window.chrome = { runtime: {} };
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });
    });

    await page.setViewport({ width: 1366, height: 768 });

    console.log(`🌐 Scraping website: ${url}`);

    // 🧭 Cargar página con mayor tolerancia a scripts bloqueados
    try {
      await page.goto(url, {
        waitUntil: ["domcontentloaded", "networkidle2"],
        timeout: 90000,
      });
    } catch (e) {
      console.warn("⚠️ Timeout or partial load detected, retrying...");
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    }

    // 🕵️ Detección de bloqueos tipo Cloudflare
    const pageContent = await page.content();
    if (
      /cloudflare|Access denied|Please enable JavaScript/i.test(pageContent)
    ) {
      console.warn("🚧 Possible Cloudflare or bot protection detected.");
    }

    // Extract title, description, and og:image
    const title = await page.title();
    const description = await page
      .$eval("meta[name='description']", (el) => el.content)
      .catch(() => "");
    const ogImage = await page
      .$eval("meta[property='og:image']", (el) => el.content)
      .catch(() => "");

    // Extract all links
    const allLinks = await page.$$eval("a", (links) =>
      links.map((l) => l.href.trim()).filter(Boolean)
    );

    // Normalize relative and protocol-less URLs
    const cleanLinks = allLinks.map((link) => {
      try {
        if (link.startsWith("//")) return "https:" + link;
        if (link.startsWith("/")) return new URL(link, location.origin).href;
        return link;
      } catch {
        return link;
      }
    });

    // Find social media links
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

    const socialLinks = [
      ...new Set(
        cleanLinks.filter((link) =>
          socialDomains.some((domain) => link.includes(domain))
        )
      ),
    ];

    console.log(`🔗 Found ${socialLinks.length} social media links`);

    // Optionally scrape deeper social info
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
    console.error("❌ Error scraping website:", error.message);
    return { error: "Failed to scrape the website." };
  }
}

module.exports = webScraper;
