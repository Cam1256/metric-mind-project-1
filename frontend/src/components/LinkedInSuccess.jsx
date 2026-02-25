import React, { useEffect, useState } from "react";

const LinkedInSuccess = () => {

  const [profile, setProfile] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [orgError, setOrgError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadData = async () => {
      try {
        // PROFILE
        const profileRes = await fetch(
          "https://api.metricmind.cloud/auth/linkedin/profile",
          { credentials: "include" }
        );

        const profileData = await profileRes.json();
        setProfile(profileData);

        // ORGANIZATIONS (optional)
        try {
          const orgRes = await fetch(
            "https://api.metricmind.cloud/auth/linkedin/organizations",
            { credentials: "include" }
          );

          const orgData = await orgRes.json();

          if (orgData.organizations) {
            setOrganizations(orgData.organizations);
          }

        } catch {
          setOrgError(true);
        }

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

      <hr style={{ margin: "30px auto", width: "400px" }} />

      <h3>🏢 Organization Access</h3>

      {organizations.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {organizations.map((org, i) => (
            <li key={i}>
              ✔ {org.organization || "LinkedIn Organization"}
            </li>
          ))}
        </ul>
      ) : orgError ? (
        <p>⚠ Organization data unavailable (API review pending)</p>
      ) : (
        <p>Organization access pending LinkedIn approval.</p>
      )}

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