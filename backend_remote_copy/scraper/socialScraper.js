/**
 * socialScraper.js (Safe Concurrent Version)
 * --------------------------------------------------
 * Avoids getting stuck on embedded or live video links.
 * Limits deep scraping and ensures backend always responds.
 */

const puppeteer = require("puppeteer");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function socialScraper(socialLinks = [], existingBrowser = null) {
  if (!socialLinks.length) return { error: "No social links provided." };

  // Filtrar duplicados y enlaces de riesgo (YouTube Live, Instagram TV, etc.)
  const filteredLinks = [
    ...new Set(
      socialLinks.filter(link =>
        !link.match(/(live|watch|playlist|embed|tv|utm_|feature=share)/i)
      )
    ),
  ].slice(0, 5); // procesar solo 5 enlaces como máximo

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

  for (const url of filteredLinks) {
    try {
      console.log(`🔗 Scraping social: ${url}`);
      const platform = getPlatformName(url);

      let data;
      try {
        // deep scrape (max 8s)
        data = await Promise.race([
          scrapeDeep(page, url, platform),
          timeoutAfter(8000, "Deep scrape timeout"),
        ]);
        data.mode = "deep";
      } catch {
        data = await scrapeLight(url, platform);
        data.mode = "light";
      }

      results[url] = data;
      await delay(1000);
    } catch (err) {
      console.error(`❌ Error scraping ${url}:`, err.message);
      results[url] = { error: err.message };
    }
  }

  if (ownBrowser) await browser.close();
  return results;
}

/* --- Utilities --- */

function timeoutAfter(ms, msg) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(msg)), ms)
  );
}

function getPlatformName(url) {
  if (url.includes("facebook.com")) return "facebook";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("twitter.com") || url.includes("x.com")) return "x";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  return "unknown";
}

async function scrapeDeep(page, url, platform) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 7000 });
  await delay(1500);

  const data = await page.evaluate(() => {
    const title = document.title || "";
    const desc =
      document.querySelector("meta[name='description']")?.content ||
      document.querySelector("meta[property='og:description']")?.content ||
      "";
    const followers =
      Array.from(document.querySelectorAll("*"))
        .map(e => e.innerText)
        .find(t => t.match(/\d+(\.\d+)?\s*(followers|seguidores)/i)) || null;

    return { title, desc, followers };
  });

  return {
    platform,
    url,
    name: data.title || "No name",
    bio: data.desc || "",
    followers: data.followers || "Not available",
  };
}

async function scrapeLight(url, platform) {
  return {
    platform,
    url,
    name: "No name",
    bio: "Skipped (light mode)",
    followers: "Not available",
  };
}

module.exports = socialScraper;
