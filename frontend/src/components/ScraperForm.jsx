import React, { useState } from "react";
import LinkedInConnectButton from "./LinkedInConnectButton"; // 👈 Import correcto
import FacebookConnectButton from "./FacebookConnectButton";



const ScraperForm = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.metricmind.cloud/scrap?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Error scraping website");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "50px auto", fontFamily: "Inter, sans-serif" }}>
      <h2>Website Intelligence Scraper</h2>

      {/* 🔗 Aquí agregamos el botón de LinkedIn */}
      <div style={{ marginBottom: "20px" }}>
        <LinkedInConnectButton />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <FacebookConnectButton />
      </div>




      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Enter website URL (e.g. https://www.dominos.com.co)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{ flex: 1, padding: "10px", fontSize: "14px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 16px",
            backgroundColor: "#0078ff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : "Analyze"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ textAlign: "left" }}>
          <h3>Scraping Results</h3>
          <p><strong>Title:</strong> {result.title || "Not available"}</p>
          <p><strong>Description:</strong> {result.description || "Not available"}</p>

          {result.socialLinks?.length > 0 && (
            <div>
              <h4>Social Media Links:</h4>
              <ul>
                {result.socialLinks.map((link, i) => (
                  <li key={i}>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.socialData && Object.keys(result.socialData).length > 0 && (
            <div>
              <h4>Social Media Data:</h4>
              <ul>
                {Object.entries(result.socialData).map(([platform, data], i) => (
                  <li key={i}>
                    <strong>{platform}</strong>:{" "}
                    {data.name || "No name"} —{" "}
                    {data.followers ? `${data.followers} followers` : "Followers not available"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScraperForm;
