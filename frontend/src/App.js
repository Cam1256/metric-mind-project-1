import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ScraperForm from "./components/ScraperForm";
import LinkedInSuccess from "./components/LinkedInSuccess";

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Metric Mind Project 1</h1>

        <Routes>
          <Route path="/" element={<ScraperForm />} />
          <Route path="/linkedin/success" element={<LinkedInSuccess />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
