import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function AuthSuccess() {
  const location = useLocation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "https://metricmind.cloud/api/linkedin/me",
          { withCredentials: true }
        );
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, [location]);

  if (!profile) return <p>Cargando datos de LinkedIn...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>🎉 LinkedIn Connected Successfully</h2>
      {profile.picture && (
        <img
          src={profile.picture}
          alt="Profile"
          width="120"
          style={{ borderRadius: "50%" }}
        />
      )}
      <p><strong>Name:</strong> {profile.name || `${profile.given_name} ${profile.family_name}`}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>LinkedIn ID:</strong> {profile.sub}</p>
    </div>
  );
}