/**
 * socialScraper.js (Hybrid Version)
 * --------------------------------------------------
 * Extrae información más profunda de perfiles sociales
 * combinando scraping visible, JSON embebido y fallback OG/meta.
 * Soporta: Facebook, Instagram, Twitter/X, TikTok, LinkedIn, YouTube.
 */

const puppeteer = require("puppeteer");
// Universal delay function (replaces deprecated page.waitForTimeout)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


/**
 * Scrape data from supported social media URLs
 * @param {Array<string>} socialLinks - List of URLs
 * @param {Object} existingBrowser - Optional Puppeteer browser instance
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
      else if (url.includes("youtube.com") || url.includes("youtu.be")) data = await scrapeYouTube(page, url);

      results[url] = data || { error: "Unsupported or empty result." };

      await new Promise(r => setTimeout(r, 2000)); // small delay
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
  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 3000));
  return await page.evaluate(() => ({
    platform: "facebook",
    url: location.href,
    name: document.querySelector("meta[property='og:title']")?.content || document.title || "",
    bio:
      document.querySelector("meta[property='og:description']")?.content ||
      document.querySelector("meta[name='description']")?.content ||
      "",
    followers: Array.from(document.querySelectorAll("*"))
      .map(e => e.innerText)
      .find(t => t && t.match(/\d+\s*(seguidores|followers)/i)) || null,
  }));
}

/** Instagram */
async function scrapeInstagram(page, url) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 4000));
  const data = await page.evaluate(() => {
    const metaBio = document.querySelector("meta[property='og:description']")?.content || "";
    let followers = metaBio.match(/([\d.,]+)\s(Followers|seguidores)/i)?.[1] || null;
    let name = document.title;

    // Try reading embedded JSON (window._sharedData)
    const script = Array.from(document.scripts).find(s => s.textContent.includes("window._sharedData"));
    if (script) {
      try {
        const jsonText = script.textContent.match(/window\._sharedData\s*=\s*(\{.+\});/)[1];
        const json = JSON.parse(jsonText);
        const user = json?.entry_data?.ProfilePage?.[0]?.graphql?.user;
        if (user) {
          name = user.full_name || user.username || name;
          followers = user.edge_followed_by?.count || followers;
        }
      } catch (_) {}
    }

    return {
      platform: "instagram",
      url: location.href,
      name,
      bio: metaBio,
      followers,
    };
  });
  return data;
}

/** Twitter / X */
async function scrapeTwitter(page, url) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 4000));;
  return await page.evaluate(() => {
    let name = document.title.replace(/ \(@.*\)/, "");
    let bio =
      document.querySelector("meta[name='description']")?.content ||
      Array.from(document.querySelectorAll("div"))
        .map(e => e.innerText)
        .find(t => t && t.length < 200 && t.match(/[\w\s.,!?]/)) ||
      "";
    const followers =
      Array.from(document.querySelectorAll("span, a"))
        .map(e => e.innerText)
        .find(t => t && t.match(/\d+(\.\d+)?\s*(seguidores|followers)/i)) || null;

    return {
      platform: "x",
      url: location.href,
      name,
      bio,
      followers,
    };
  });
}

/** TikTok */
async function scrapeTikTok(page, url) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await delay(4000);
  return await page.evaluate(() => {
    const name =
      document.querySelector("h1 strong")?.innerText ||
      document.querySelector("meta[property='og:title']")?.content ||
      document.title;
    const bio =
      document.querySelector("h2[data-e2e='user-bio']")?.innerText ||
      document.querySelector("meta[property='og:description']")?.content ||
      "";
    const followers =
      Array.from(document.querySelectorAll("*"))
        .map(e => e.innerText)
        .find(t => t && t.match(/\d+(\.\d+)?\s*(followers|seguidores)/i)) || null;

    return { platform: "tiktok", url: location.href, name, bio, followers };
  });
}

/** LinkedIn */
async function scrapeLinkedIn(page, url) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await delay(3000);
  return await page.evaluate(() => ({
    platform: "linkedin",
    url: location.href,
    name: document.title || "",
    bio:
      document.querySelector("meta[name='description']")?.content ||
      document.querySelector("p")?.innerText ||
      "",
    followers:
      Array.from(document.querySelectorAll("*"))
        .map(e => e.innerText)
        .find(t => t && t.match(/\d+(\.\d+)?\s*(seguidores|followers)/i)) || null,
  }));
}

/** YouTube */
async function scrapeYouTube(page, url) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  await delay(4000);
  return await page.evaluate(() => {
    let name = document.title.replace("- YouTube", "").trim();
    let followers = null;

    // Intentar leer JSON embebido con conteo de suscriptores
    const html = document.documentElement.innerHTML;
    const match = html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"/);
    if (match) followers = match[1];

    return {
      platform: "youtube",
      url: location.href,
      name,
      bio: document.querySelector("meta[name='description']")?.content || "",
      followers,
    };
  });
}

module.exports = socialScraper;
