import React from "react";
import { useAuth } from "../context/AuthContext";

export default function FacebookConnectButton() {
  const { user } = useAuth(); // usuario Cognito

  if (!user?.sub) {
    console.warn("No Cognito user found");
    return null;
  }

  const loginUrl = `https://api.metricmind.cloud/auth/facebook/login?state=${user.sub}`;

  return (
    <a
      href={loginUrl}
      style={{
        padding: "12px 18px",
        backgroundColor: "#1877f2",
        color: "#fff",
        borderRadius: "6px",
        textDecoration: "none",
        display: "inline-block",
        fontWeight: "bold",
      }}
    >
      Connect Facebook
    </a>
  );
}
