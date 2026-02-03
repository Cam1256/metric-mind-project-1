const { mapScraperResultToSignals } = require(
  "./domain/signals/scraperSignalMapper"
);
const { analyzeSignals } = require(
  "./domain/signals/signalAnalysis"
);

const scrapingResult = {
  title: "EduIALogic. Transformamos la educación digital en Colombia",
  description:
    "EduIAlogic es una plataforma especializada en contenidos educativos digitales.",
  socialLinks: [
    "https://www.tiktok.com/@eduialogic",
    "https://www.linkedin.com/in/edu-ialogic/"
  ],
  socialData: {
    tiktok: {
      followers: 7,
      likes: 6,
      bio: ""
    },
    linkedin: {
      available: false
    }
  }
};

const signals = mapScraperResultToSignals(scrapingResult);

console.log("🧩 Signals:");
console.log(signals);

console.log("\n🧪 Analysis:");
console.log(analyzeSignals(signals));
