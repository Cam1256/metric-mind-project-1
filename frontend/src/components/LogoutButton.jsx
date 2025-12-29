// src/components/LogoutButton.jsx
import React from "react";
import { useAuth } from "react-oidc-context";

const LogoutButton = () => {
  const auth = useAuth();

  const handleLogout = () => {
    // Solo hacemos el redirect al logout sin pasar id_token_hint manual
    auth.removeUser(); // Limpiamos localmente la sesión
    window.location.href = "https://us-east-1cfo0hbqso.auth.us-east-1.amazoncognito.com/logout?client_id=ve397u9sm47ps24a9mbo55qi7&logout_uri=https://www.metricmind.cloud/";
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "10px 20px",
        marginTop: "20px",
        backgroundColor: "#555",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Sign Out
    </button>
  );
};

export default LogoutButton;
