/**
 * socialScraper.js (Stable Fixed Version)
 * --------------------------------------------------
 * Corrige errores de `undefined.match` y evita que Puppeteer rompa el flujo.
 */

const puppeteer = require("puppeteer");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function socialScraper(socialLinks = [], existingBrowser = null) {
  if (!socialLinks.length) return { error: "No social links provided." };

  const filteredLinks = [
    ...new Set(
      socialLinks.filter(
        link =>
          !link.match(
            /(live|watch|playlist|embed|tv|utm_|feature=share|shorts)/i
          )
      )
    ),
  ].slice(0, 5);

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
    const platform = getPlatformName(url);
    try {
      console.log(`🔗 Scraping social: ${url}`);

      let data;
      try {
        data = await Promise.race([
          scrapeDeep(page, url, platform),
          timeoutAfter(10000, "Deep scrape timeout"),
        ]);
        data.mode = "deep";
      } catch (err) {
        console.warn(`⚠️ Deep scrape failed (${platform}): ${err.message}`);
        data = await scrapeLight(url, platform);
        data.mode = "light";
      }

      results[url] = data;
      await delay(1000);
    } catch (err) {
      console.error(`❌ Error scraping ${url}:`, err.message);
      results[url] = { platform, error: err.message };
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

/* --- Main Deep Scraper --- */
async function scrapeDeep(page, url, platform) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 8000 });
  await delay(3000);

  switch (platform) {
    case "linkedin":
      return await scrapeLinkedIn(page, url);
    case "tiktok":
      return await scrapeTikTok(page, url);
    case "instagram":
      return await scrapeInstagram(page, url);
    case "youtube":
      return await scrapeYouTube(page, url);
    default:
      return await scrapeGeneric(page, url, platform);
  }
}

/* --- Fallback Light Mode --- */
async function scrapeLight(url, platform) {
  return {
    platform,
    url,
    name: "No name",
    bio: "Skipped (light mode)",
    followers: "Not available",
  };
}

/* --- Platform Specific Scrapers --- */
async function scrapeLinkedIn(page, url) {
  const data = await page.evaluate(() => {
    const clean = str => (str ? str.replace(/\s+/g, " ").trim() : "");
    try {
      const isCompany = location.pathname.includes("/company/");
      const isProfile = location.pathname.includes("/in/");

      let name = document.title || "";
      let bio = "";
      let followers = "";

      if (isCompany) {
        bio =
          document.querySelector("meta[name='description']")?.content ||
          document.querySelector("p")?.innerText ||
          "";
        followers =
          Array.from(document.querySelectorAll("*"))
            .map(e => e.innerText)
            .find(t =>
              typeof t === "string" &&
              t.match(/\d+(\.\d+)?\s*(followers|seguidores|empleados)/i)
            ) || "";
      } else if (isProfile) {
        const ogTitle = document.querySelector("meta[property='og:title']")?.content;
        const ogDesc = document.querySelector("meta[property='og:description']")?.content;

        name = ogTitle || document.title;
        bio = ogDesc || "";

        followers =
          Array.from(document.querySelectorAll("*"))
            .map(e => e.innerText)
            .find(t =>
              typeof t === "string" &&
              t.match(/\d+(\+)?\s*(conexiones|connections|followers)/i)
            ) || "";
      }

      return {
        platform: "linkedin",
        url: location.href,
        name: clean(name),
        bio: clean(bio),
        followers: clean(followers) || "Not available",
      };
    } catch (e) {
      return {
        platform: "linkedin",
        url: location.href,
        name: "No name",
        bio: "Error parsing LinkedIn",
        followers: "Not available",
      };
    }
  });

  return data;
}

async function scrapeGeneric(page, url, platform) {
  const data = await page.evaluate(() => {
    try {
      const title = document.title || "";
      const desc =
        document.querySelector("meta[name='description']")?.content ||
        document.querySelector("meta[property='og:description']")?.content ||
        "";
      const followers =
        Array.from(document.querySelectorAll("*"))
          .map(e => e.innerText)
          .find(
            t =>
              typeof t === "string" &&
              t.match(/\d+(\.\d+)?\s*(followers|seguidores)/i)
          ) || "";

      return { title, desc, followers };
    } catch (err) {
      return { title: "", desc: "", followers: "" };
    }
  });

  return {
    platform,
    url,
    name: data.title || "No name",
    bio: data.desc || "",
    followers: data.followers || "Not available",
  };
}

/* --- Others (same as before) --- */
async function scrapeTikTok(page, url) {
  const data = await page.evaluate(() => {
    try {
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
          .find(
            t =>
              typeof t === "string" &&
              t.match(/\d+(\.\d+)?\s*(followers|seguidores)/i)
          ) || "";

      return {
        platform: "tiktok",
        url: location.href,
        name,
        bio,
        followers: followers || "Not available",
      };
    } catch (e) {
      return {
        platform: "tiktok",
        url: location.href,
        name: "No name",
        bio: "Error parsing TikTok",
        followers: "Not available",
      };
    }
  });
  return data;
}

async function scrapeInstagram(page, url) {
  const data = await page.evaluate(() => {
    try {
      const name = document.title.replace(/ \(@.*\)/, "");
      const bio =
        document.querySelector("meta[property='og:description']")?.content || "";
      const followers =
        bio.match(/([\d.,]+)\s(Followers|seguidores)/i)?.[1] || "";

      return {
        platform: "instagram",
        url: location.href,
        name,
        bio,
        followers: followers || "Not available",
      };
    } catch {
      return {
        platform: "instagram",
        url: location.href,
        name: "No name",
        bio: "Error parsing Instagram",
        followers: "Not available",
      };
    }
  });
  return data;
}

async function scrapeYouTube(page, url) {
  const data = await page.evaluate(() => {
    try {
      const name = document.title.replace("- YouTube", "").trim();
      const desc =
        document.querySelector("meta[name='description']")?.content || "";
      const match = document.documentElement.innerHTML.match(
        /"subscriberCountText":\{"simpleText":"([^"]+)"/
      );
      const followers = match ? match[1] : "Not available";

      return {
        platform: "youtube",
        url: location.href,
        name,
        bio: desc,
        followers,
      };
    } catch {
      return {
        platform: "youtube",
        url: location.href,
        name: "No name",
        bio: "Error parsing YouTube",
        followers: "Not available",
      };
    }
  });
  return data;
}

module.exports = socialScraper;
