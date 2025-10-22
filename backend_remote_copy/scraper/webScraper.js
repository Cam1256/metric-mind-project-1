const puppeteer = require('puppeteer');

/**
 * Función para scrapear cualquier página web dinámica
 * @param {string} url
 */
async function scrapWebsite(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote'
      ]
    });

    const page = await browser.newPage();

    // Evitar bloqueos de algunos sitios
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2' }); // espera que cargue el JS

    // Extraer título
    const title = await page.title();

    // Extraer meta description
    const description = await page.$eval(
      'meta[name="description"]',
      el => el.content
    ).catch(() => '');

    // Extraer enlaces a redes sociales (facebook, instagram, twitter)
    const socialLinks = await page.$$eval('a', links =>
      links
        .map(l => l.href)
        .filter(href =>
          href.includes('facebook.com') ||
          href.includes('instagram.com') ||
          href.includes('twitter.com')
        )
    );

    await browser.close();

    return { title, description, socialLinks };
  } catch (error) {
    if (browser) await browser.close();
    console.error('Error scraping website:', error.message);
    return { error: 'No se pudo scrapear la página. Tal vez requiere renderizado dinámico.' };
  }
}

// Prueba rápida
if (require.main === module) {
  scrapWebsite('https://www.dominos.com.co').then(console.log);
}

module.exports = scrapWebsite;
