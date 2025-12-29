import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ScraperForm from "./components/ScraperForm";
import LinkedInSuccess from "./components/LinkedInSuccess";
import LoginPage from "./components/LoginPage";
import AuthCallback from "./components/AuthCallback";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/scraper" element={<ScraperForm />} />
          <Route path="/linkedin/success" element={<LinkedInSuccess />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
