import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";

import ScraperForm from "./components/ScraperForm";
import LinkedInSuccess from "./components/LinkedInSuccess";
import LoginPage from "./components/LoginPage";
import AuthCallback from "./components/AuthCallback";

const PrivateRoute = ({ children }) => {
  const auth = useAuth();
  if (!auth.isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/intelligence" element={<PrivateRoute><ScraperForm /></PrivateRoute>} />
        <Route path="/scraper" element={<Navigate to="/intelligence" />} />
        <Route path="/linkedin/success" element={<LinkedInSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;
