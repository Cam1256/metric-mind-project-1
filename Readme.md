# 🧠 Metric Mind – Project 1

**Metric Mind** is the foundation of an intelligent strategic reasoning system for businesses.  
This first version (MVP) includes a **web scraper** that extracts meaningful information from company websites to automatically build an initial business profile — the starting point for a future AI that understands, analyzes, and challenges business strategies.

---

## 🚀 Features

- 🌐 **Dynamic Web Scraper**: Extracts title, description, and social media links (Facebook, Instagram, Twitter) from any website.  
- ⚙️ **Node.js Backend (Express + Puppeteer)**: Handles web scraping using a headless Chrome instance.  
- 💻 **React Frontend**: Simple interface for testing URLs and visualizing results in real time.  
- 🔒 **HTTPS + Nginx + PM2 Deployment**: Fully configured on production server with domain:
  - [https://metricmind.cloud](https://metricmind.cloud)
  - [https://api.metricmind.cloud](https://api.metricmind.cloud)

---

## 🧩 Tech Stack

**Frontend:**
- React.js (Functional Components + Hooks)
- Fetch API for backend communication
- Deployed under Nginx (HTTPS)

**Backend:**
- Node.js
- Express.js
- Puppeteer (headless Chrome)
- PM2 for process management
- Nginx reverse proxy with SSL (Let’s Encrypt)

---

## ⚡ Project Structure

```
metric-mind-project-1/
├── frontend/ # React app (user interface)
├── backend/ # Express + Puppeteer server
├── .gitignore
└── README.md
```

---

## 🧠 Vision

This MVP lays the foundation for a broader AI system that can:
- Analyze a company’s digital footprint.
- Build structured “business fingerprints.”
- Compare competitors automatically.
- Generate strategic insights and adaptive reasoning trees — as described by the **MetricMind Framework**.

---

## 🧪 How to Run Locally

**1️⃣ Clone the repository**
```bash
git clone https://github.com/Cam1256/metric-mind-project-1.git
cd metric-mind-project-1

🌍 Production Deployment

Server: Debian VPS (Clouding)

Process manager: PM2

Web server: Nginx (reverse proxy)

SSL: Let’s Encrypt certificates auto-renewed

Domains:

metricmind.cloud

👥 Authors

Cristian Camilo Cuevas Castañeda
CTO

Michael Malmgren
CEO