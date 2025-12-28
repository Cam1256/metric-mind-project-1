import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const LinkedInSuccess = () => {
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      localStorage.setItem("linkedin_access_token", token);
      console.log("Token saved:", token);
    }
  }, [params]);

  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h1>🎉 LinkedIn Connected Successfully</h1>
      <p>Your LinkedIn account is now connected to MetricMind!</p>

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
