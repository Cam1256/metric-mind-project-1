import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AuthSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const provider = params.get("provider");

    if (provider === "linkedin") {
      console.log("✅ Login LinkedIn OK");
      navigate("/dashboard"); // o donde quieras
    }
  }, [location, navigate]);

  return <p>Autenticando con LinkedIn...</p>;
}
