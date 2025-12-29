// src/components/LoginPage.jsx
import React from "react";
import { useAuth } from "react-oidc-context";

const LoginPage = () => {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "ve397u9sm47ps24a9mbo55qi7";
    const logoutUri = "https://www.metricmind.cloud/";
    const cognitoDomain = "https://metricmind.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const socialLogin = (provider) => {
    auth.signinRedirect({ identity_provider: provider });
  };

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;

  return (
    <div style={{ padding: "40px", fontFamily: "Inter, sans-serif" }}>
      {!auth.isAuthenticated ? (
        <div>
          <h2>Login / Register to Metric Mind</h2>

          <button onClick={() => auth.signinRedirect()} style={{ padding: "10px 20px", margin: "10px" }}>
            Login / Register with Email
          </button>

          <button onClick={() => socialLogin("Google")} style={{ padding: "10px 20px", margin: "10px", backgroundColor: "#db4437", color: "#fff" }}>
            Login with Google
          </button>

          <button onClick={() => socialLogin("Facebook")} style={{ padding: "10px 20px", margin: "10px", backgroundColor: "#1877f2", color: "#fff" }}>
            Login with Facebook
          </button>

          <button onClick={() => socialLogin("LinkedIn")} style={{ padding: "10px 20px", margin: "10px", backgroundColor: "#0073b1", color: "#fff" }}>
            Login with LinkedIn
          </button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {auth.user?.profile?.email}</h2>
          <pre>ID Token: {auth.user?.id_token}</pre>
          <pre>Access Token: {auth.user?.access_token}</pre>
          <button onClick={signOutRedirect} style={{ padding: "10px 20px", marginTop: "20px" }}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
