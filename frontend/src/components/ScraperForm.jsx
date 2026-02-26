import React, { useState } from "react";
import { useAuth } from "react-oidc-context"; 
import LinkedInConnectButton from "./LinkedInConnectButton"; // 👈 Import correcto
import FacebookConnectButton from "./FacebookConnectButton";
import LogoutButton from "./LogoutButton";
import LinkedInFlowV0 from "./linkedin/LinkedInFlowV0";
import { useEffect } from "react";




const ScraperForm = () => {
  const auth = useAuth();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    if (!auth.isAuthenticated) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const token = auth.user?.id_token;


    if (!token) {
      setError("Authentication token missing.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://api.metricmind.cloud/api/analyze-website",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Error scraping website");
      } else {
        setResult(data);
        localStorage.setItem(
          "metricmind_last_analysis",
          JSON.stringify(data)
        );
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const checkLinkedInStatus = async () => {
    try {
      const res = await fetch(
        "https://api.metricmind.cloud/linkedin/status",
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.connected) {
        setLinkedinConnected(true);
      }
    } catch (err) {
      console.error("Failed to check LinkedIn status");
    }
  };

  checkLinkedInStatus();
}, []);

  return (
    <div style={{ maxWidth: "700px", margin: "50px auto", fontFamily: "Inter, sans-serif" }}>
      <h2>MetricMind – Website Intelligence (v0)</h2>
      <h3>Early signal collection via authorized platform connections</h3>
      <LogoutButton />
      {/* 🔗 Aquí agregamos el botón de LinkedIn */}
      {result && result.entity && (
        <div
          style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #eee",
          }}
        >
          <h3>Platform enrichment</h3>

          <p style={{ fontSize: "14px", color: "#555" }}>
            Enrich digital signals for{" "}
            <strong>
              {result.entity.resolvedDomain || result.entity.input}
            </strong>{" "}
            using authorized platform connections.
          </p>

          {!linkedinConnected && <LinkedInConnectButton />}

          {result && linkedinConnected && (
            <LinkedInFlowV0
              key={result.entity?.resolvedDomain}
              entity={result.entity?.resolvedDomain}
            />
          )}

        </div>
      )}

      



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
          disabled={loading || !auth.isAuthenticated}
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
        <div style={{ textAlign: "left", marginTop: "30px" }}>
          <h3>Digital Presence Intelligence Snapshot</h3>

          <p>
            <strong>Website:</strong>{" "}
            {result.entity?.resolvedDomain || result.entity?.input}
          </p>

          <p>
            <strong>Observability:</strong>{" "}
            {result.snapshot?.observable?.toUpperCase() || "UNKNOWN"}
          </p>

          <p>
            <strong>Blocked:</strong>{" "}
            {result.snapshot?.blocked ? "Yes" : "No"}
          </p>

          <p>
            <strong>Confidence:</strong>{" "}
            {result.meta?.confidence || "unknown"}
          </p>

          <hr />

          <h4>Observed Public Signals</h4>
          <ul>
            {result.signals?.map((signal, i) => (
              <li key={i}>
              {signal.value ? "✅" : "❌"} {signal.type} (
              {signal.source === "scraper:web" ? "public_web" : signal.source}
              )
            </li>

            ))}
          </ul>

          {result.analysis?.warnings?.length > 0 && (
            <>
              <h4>Warnings</h4>
              <ul>
                {result.analysis.warnings.map((w, i) => (
                  <li key={i}>⚠️ {w.message}</li>
                ))}
              </ul>
            </>
          )}

          {result.raw && (
            <>
              <h4>Public Evidence</h4>
              <p>
                <strong>Title:</strong>{" "}
                {result.raw.title || "Not available"}
              </p>

              {result.raw.socialLinks?.length > 0 && (
                <>
                  <p>
                    <strong>Social links detected:</strong>
                  </p>
                  <ul>
                    {result.raw.socialLinks.map((link, i) => (
                      <li key={i}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}

          <p style={{ fontSize: "12px", color: "#666", marginTop: "15px" }}>
            Signals derived from publicly observable sources only.
          </p>
        </div>
      )}

  
    </div>
  );
};

export default ScraperForm;
