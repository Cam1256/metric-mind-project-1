import React, { useEffect, useState } from "react";

const LinkedInSuccess = () => {

  const [profile, setProfile] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {

    const loadData = async () => {
      try {

        const res = await fetch(
          "https://api.metricmind.cloud/auth/linkedin/context",
          { credentials: "include" }
        );

        if (!res.ok) {
          throw new Error("Failed to load context");
        }

        const data = await res.json();

        console.log("FULL CONTEXT:", data);

        setProfile(data.profile || null);
        setAnalysis(data.analysis || null);

      } catch (err) {
        console.error("LinkedIn load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

  }, []);

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Loading LinkedIn data...
      </h2>
    );
  }

  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h1>🎉 LinkedIn Connected Successfully</h1>

      {profile && (
        <div style={{ marginTop: "30px" }}>
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>

          {profile.picture && (
            <img
              src={profile.picture}
              alt="Profile"
              style={{ width: "120px", borderRadius: "50%" }}
            />
          )}
        </div>
      )}

      <div style={{ marginTop: "40px", textAlign: "left", maxWidth: "500px", margin: "40px auto" }}>
        <h3>🧠 MetricMind Signal Snapshot</h3>

        {analysis ? (
          <>
            <p><strong>Website:</strong> {analysis.entity?.resolvedDomain}</p>
            <p><strong>Observability:</strong> {analysis.snapshot?.observable}</p>
            <p><strong>Confidence:</strong> {analysis.meta?.confidence}</p>
          </>
        ) : (
          <p>Waiting for analysis context...</p>
        )}
      </div>

      <hr style={{ margin: "30px auto", width: "400px" }} />

      <h3>🏢 Organization Access</h3>

      <p>
      🚧 Organization insights will unlock once LinkedIn
      Community Management API access is approved.
      </p>

      <p style={{ marginTop: "20px" }}>
        <strong>Connected via OAuth 2.0</strong>
      </p>
      <p>Scopes granted: openid, profile, email</p>

      <a
        href="/"
        style={{
          padding: "10px 20px",
          backgroundColor: "#0073b1",
          color: "white",
          textDecoration: "none",
          borderRadius: "8px",
          marginTop: "20px",
          display: "inline-block"
        }}
      >
        Go Back to Dashboard
      </a>
    </div>
  );
};

export default LinkedInSuccess;