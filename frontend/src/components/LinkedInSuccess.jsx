import React, { useEffect, useState } from "react";

const LinkedInSuccess = () => {
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.metricmind.cloud/auth/linkedin/profile", {
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to load profile");
        }
        return res.json();
      })
      .then(data => {
        console.log("PROFILE RESPONSE:", data);
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setProfile(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading LinkedIn data...</h2>;
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

      <p><strong>Connected via OAuth 2.0</strong></p>
      <p>Scopes granted: openid, profile, email</p>
    </div>
  );
};

export default LinkedInSuccess;