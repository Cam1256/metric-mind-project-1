import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/scraper", { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  if (auth.isLoading) return <div style={{ padding: 40 }}>Finalizando autenticación...</div>;
  if (auth.error) return <div>Error autenticando: {auth.error.message}</div>;

  return null; // No mostrar nada mientras procesa
};

export default AuthCallback;
