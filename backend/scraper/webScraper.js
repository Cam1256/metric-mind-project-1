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
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/115.0 Safari/537.36"
    );

    console.log(`🌐 Scraping website: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Extract title, description, and og:image
    const title = await page.title();
    const description = await page.$eval(
      "meta[name='description']",
      el => el.content
    ).catch(() => "");
    const ogImage = await page.$eval(
      "meta[property='og:image']",
      el => el.content
    ).catch(() => "");

    // Extract all hrefs from <a> and <svg><a>
    const allLinks = await page.$$eval("a", links =>
      links.map(l => l.href.trim()).filter(Boolean)
    );

    // Normalize links (fix relative, protocol-less)
    const cleanLinks = allLinks.map(link => {
      if (link.startsWith("//")) return "https:" + link;
      if (link.startsWith("/")) return new URL(link, location.origin).href;
      return link;
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
        cleanLinks.filter(link =>
          socialDomains.some(domain => link.includes(domain))
        )
      ),
    ];

    console.log(`🔗 Found ${socialLinks.length} social media links`);

    // Call socialScraper for deeper data
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
