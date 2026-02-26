import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const LinkedInSuccess = () => {

  const [profile, setProfile] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const navigate = useNavigate();

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
      <h1>🎉 MetricMind Signal Layer Activated</h1>

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

      <div
        style={{
          marginTop: "40px",
          textAlign: "left",
          maxWidth: "500px",
          margin: "40px auto"
        }}
      >
        <h3>🧠 MetricMind Signal Snapshot</h3>

        {/* 🔥 ESTADO DEL MOTOR */}
        <div
          style={{
            background: "#f5f7fa",
            padding: "10px 14px",
            borderRadius: "8px",
            marginBottom: "15px"
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Signal Confidence:</strong> EARLY
          </p>
          <p style={{ margin: 0 }}>
            <strong>Learning Mode:</strong> ACTIVE
          </p>
        </div>

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
      🚧 Organization-level insights pending platform approval.
      Identity signals already active.

      </p>

      <p style={{ marginTop: "20px" }}>
        <strong>Connected via OAuth 2.0</strong>
      </p>
      <p>Scopes granted: openid, profile, email</p>

      <button
        onClick={() => navigate("/intelligence")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0073b1",
          color: "white",
          border: "none",
          borderRadius: "8px",
          marginTop: "20px",
          cursor: "pointer"
        }}
      >
        Go Back to Dashboard
      </button>
    </div>
  );
};

export default LinkedInSuccess;