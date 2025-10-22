const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: ['https://metricmind.cloud', 'https://www.metricmind.cloud']
}));

app.use(express.json());

const scrapWebsite = require('./scraper/webScraper'); // <--- agregamos esto


const PORT = process.env.PORT || 5000;


app.get('/', (req, res) => {
  res.send('Backend Metric Mind funcionando ✅');
});

// NUEVO ENDPOINT PARA SCRAPING
app.get('/scrap', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send({ error: 'Falta parámetro url' });

  const result = await scrapWebsite(url);
  if (!result) return res.status(500).send({ error: 'Error al scrapear' });

  res.send(result);
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));


