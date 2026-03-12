import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";


const LinkedInSuccess = () => {

  const [profile, setProfile] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const navigate = useNavigate();
  const auth = useAuth();
  const [postUrl, setPostUrl] = useState("");
  const [postUrn, setPostUrn] = useState(null);

  console.log("OIDC AUTH:", auth.isAuthenticated)

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

  const publishToLinkedIn = () => {

    const domain = analysis?.entity?.resolvedDomain || "the monitored entity";

    const text = encodeURIComponent(
      `MetricMind signal detected for ${domain}. Monitoring early digital presence signals.`
    );

    const url = encodeURIComponent("https://metricmind.cloud");

    const shareUrl =
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`;

    window.open(shareUrl, "_blank");

  };

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Loading LinkedIn data...
      </h2>
    );
  }
  function extractPostURN(url) {
    if (!url.includes("linkedin.com")) return null;

    const match = url.match(/urn:li:activity:\d+/);
    return match ? match[0] : null;
  }

  const handleTrackPost = () => {
    
    const urn = extractPostURN(postUrl.trim());
    if (urn) {
      setPostUrn(urn);
    } else {
      alert("Invalid LinkedIn post URL");
    }
  };
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
        onClick={publishToLinkedIn}
        style={{
          marginTop: "20px",
          padding: "10px 16px",
          backgroundColor: "#0a66c2",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Publish Insight to LinkedIn
      </button>

      <hr style={{ margin: "30px auto", width: "400px" }} />

      <h3>🔗 Track LinkedIn Post</h3>

      <p style={{ fontSize: "14px", color: "#555" }}>
      Paste the URL of the LinkedIn post you just published to start tracking engagement signals.
      </p>

      <input
        type="text"
        placeholder="Paste LinkedIn post URL"
        value={postUrl}
        onChange={(e) => setPostUrl(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "10px",
          marginTop: "10px"
        }}
      />

      <br />

      <button
        onClick={handleTrackPost}
        style={{
          marginTop: "10px",
          padding: "10px 16px",
          backgroundColor: "#0073b1",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
      Start Tracking
      </button>
      {postUrn && (
        <div
          style={{
            marginTop: "20px",
            background: "#f5f7fa",
            padding: "15px",
            borderRadius: "8px"
          }}
        >
          <h4>📊 LinkedIn Post Tracking</h4>

          <p><strong>Entity monitored:</strong> {analysis?.entity?.resolvedDomain}</p>
          <p><strong>Post URN:</strong> {postUrn}</p>
          <p><strong>Post URL:</strong> {postUrl}</p>

          <p><strong>Status:</strong> Post registered for engagement monitoring</p>

          <p style={{ fontSize: "12px", color: "#666" }}>
            MetricMind will monitor reactions and comments associated with this LinkedIn post.
          </p>
        </div>
      )}

      <button
        onClick={() => {
          if (auth.isAuthenticated) {
            navigate("/intelligence");
          } else {
            window.location.href = "/login";
          }
        }}
      >
        Go Back to Dashboard
      </button>
    </div>
  );
};

export default LinkedInSuccess;