/**
 * socialScraper.js
 * --------------------------------------------------
 * Extracts key data (name, bio, followers, etc.)
 * from social media profiles dynamically.
 * Supports Facebook, Instagram, Twitter/X, TikTok, and LinkedIn.
 */

const puppeteer = require("puppeteer");

/**
 * Scrape data from supported social media URLs
 * @param {Array<string>} socialLinks - List of URLs (from webScraper)
 * @param {Object} existingBrowser - Optional browser instance to reuse
 * @returns {Object} Extracted social data
 */
async function socialScraper(socialLinks = [], existingBrowser = null) {
  if (!socialLinks.length) return { error: "No social links provided." };

  const browser =
    existingBrowser ||
    (await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
      ],
    }));

  const ownBrowser = !existingBrowser;
  const page = await browser.newPage();
  const results = {};

  for (const url of socialLinks) {
    try {
      console.log(`🔗 Scraping social: ${url}`);
      let data = {};

      if (url.includes("facebook.com")) data = await scrapeFacebook(page, url);
      else if (url.includes("instagram.com")) data = await scrapeInstagram(page, url);
      else if (url.includes("twitter.com") || url.includes("x.com")) data = await scrapeTwitter(page, url);
      else if (url.includes("tiktok.com")) data = await scrapeTikTok(page, url);
      else if (url.includes("linkedin.com")) data = await scrapeLinkedIn(page, url);

      if (data) results[url] = data;

      // Small delay to prevent rate-limiting
      await new Promise(r => setTimeout(r, 1500));

    } catch (err) {
      console.error(`❌ Error scraping ${url}:`, err.message);
      results[url] = { error: err.message };
    }
  }

  if (ownBrowser) await browser.close();
  return results;
}

/* ─────────────── INDIVIDUAL SCRAPERS ─────────────── */

/** Facebook */
async function scrapeFacebook(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  return await page.evaluate(() => ({
    platform: "facebook",
    url: location.href,
    name: document.querySelector("meta[property='og:title']")?.content || "",
    bio: document.querySelector("meta[property='og:description']")?.content || "",
    followers: null,
  }));
}

/** Instagram */
async function scrapeInstagram(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  return await page.evaluate(() => {
    const bio = document.querySelector("meta[property='og:description']")?.content || "";
    const followers = bio.match(/([\d.,]+)\sFollowers/)?.[1] || null;
    return {
      platform: "instagram",
      url: location.href,
      name: document.title,
      bio,
      followers,
    };
  });
}

/** Twitter / X */
async function scrapeTwitter(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  return await page.evaluate(() => {
    const bio = document.querySelector("meta[name='description']")?.content || "";
    const followers = bio.match(/([\d.,]+)\sFollowers/)?.[1] || null;
    return {
      platform: "x",
      url: location.href,
      name: document.title,
      bio,
      followers,
    };
  });
}

/** TikTok */
async function scrapeTikTok(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  return await page.evaluate(() => {
    const bio = document.querySelector("meta[property='og:description']")?.content || "";
    const followers = bio.match(/([\d.,]+)\sFollowers/)?.[1] || null;
    return {
      platform: "tiktok",
      url: location.href,
      name: document.title,
      bio,
      followers,
    };
  });
}

/** LinkedIn */
async function scrapeLinkedIn(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  return await page.evaluate(() => ({
    platform: "linkedin",
    url: location.href,
    name: document.title,
    bio: document.querySelector("meta[name='description']")?.content || "",
    followers: null,
  }));
}

module.exports = socialScraper;
