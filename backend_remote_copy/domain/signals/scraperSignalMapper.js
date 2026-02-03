const { createSignal } = require("./signalFactory");

/**
 * Maps raw scraper output into domain signals
 */
function mapScraperResultToSignals(scrapingResult) {
  const signals = [];

  // 1️⃣ Presencia digital básica
  if (scrapingResult.title || scrapingResult.description) {
    signals.push(createSignal("presence", true));
  } else {
    signals.push(createSignal("presence", false));
  }

  // 2️⃣ Redes sociales detectadas
  const socialLinks = scrapingResult.socialLinks || [];
  const socialData = scrapingResult.socialData || {};

  // TikTok
  if (socialLinks.some(link => link.includes("tiktok.com"))) {
    signals.push(createSignal("social_platform", true, { platform: "tiktok" }));

    const tiktokData = socialData.tiktok || {};

    // Followers
    if (typeof tiktokData.followers === "number") {
      signals.push(
        createSignal("activity", tiktokData.followers, { platform: "tiktok" })
      );
    }


    // Actividad (muy básica por ahora)
    const hasActivity =
      (tiktokData.likes && tiktokData.likes > 0) ||
      (tiktokData.bio && tiktokData.bio.trim() !== "");

    signals.push(
      createSignal("activity", hasActivity ? 1 : 0, { platform: "tiktok" })

    );
  }

  // LinkedIn
  if (socialLinks.some(link => link.includes("linkedin.com"))) {
    signals.push(createSignal("social_platform", true, { platform: "linkedin" }));

    const linkedinData = socialData.linkedin || {};

    signals.push(
      createSignal(
        "activity",
        linkedinData.available === true ? 1 : 0,
        { platform: "linkedin" }
      )
    );
  }

  return signals;
}

module.exports = {
  mapScraperResultToSignals
};
