import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import ThemeSelection from "./components/ThemeSelection";
import AboutPage from "./components/AboutPage";
import GalleryPage from "./components/GalleryPage";
import FAQPage from "./components/FAQPage";
import FeedbackPage from "./components/FeedbackPage";

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [theme, setTheme] = useState(null);

  const handleLogin = (tkn, rl) => {
    setToken(tkn);
    setRole(rl);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
  };

  const handleThemeSelect = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
        {/* Routes */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route
              path="/login"
              element={
                token ? (
                  role === "admin" ? (
                    <Navigate to="/admin" />
                  ) : !theme ? (
                    <Navigate to="/theme" />
                  ) : (
                    <Navigate to="/dashboard" />
                  )
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/signup"
              element={
                token ? (
                  role === "admin" ? (
                    <Navigate to="/admin" />
                  ) : !theme ? (
                    <Navigate to="/theme" />
                  ) : (
                    <Navigate to="/dashboard" />
                  )
                ) : (
                  <Signup onLogin={handleLogin} />
                )
              }
            />

            <Route
              path="/dashboard"
              element={
                token && role === "user" ? (
                  <Dashboard token={token} onLogout={handleLogout} theme={theme} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/theme"
              element={
                token && role === "user" ? (
                  <ThemeSelection token={token} onThemeSelect={handleThemeSelect} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/admin"
              element={
                token && role === "admin" ? (
                  <AdminDashboard token={token} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* fallback */}
            
            <Route path="/about" element={<AboutPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
