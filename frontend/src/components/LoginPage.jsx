import React from "react";
import { useAuth } from "react-oidc-context";

const LoginPage = () => {
  const auth = useAuth();

  const logout = () => {
    auth.signoutRedirect({
      post_logout_redirect_uri: "https://www.metricmind.cloud/",
    });
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
          <h2>Login / Register to MetricMind</h2>

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
          <button onClick={logout} style={{ padding: "10px 20px", marginTop: "20px" }}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
