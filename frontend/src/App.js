import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import UserRegistrations from "./components/UserRegistrations";
import AdminDashboard from "./components/AdminDashboard";
import AdminCategoryList from "./components/AdminCategoryList";
import AdminCategoryPage from "./components/AdminCategoryPage";
import AdminCategoryCreate from "./components/AdminCategoryCreate";
import AdminCertificatePage from "./components/AdminCertificatePage";
import UserCertificatePage from "./components/UserCertificatePage";
import ThemeSelection from "./components/ThemeSelection";
import AboutPage from "./components/AboutPage";
import GalleryPage from "./components/GalleryPage";
import FAQPage from "./components/FAQPage";
import FeedbackPage from "./components/FeedbackPage";
import Layout from "./components/Layout";

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [theme, setTheme] = useState(null);
  const [user, setUser] = useState(null);

  const handleLogin = (tkn, rl, userData) => {
    setToken(tkn);
    setRole(rl);
    setUser(userData);
    try {
      localStorage.setItem("auth_token", tkn);
      localStorage.setItem("auth_role", rl || "");
      if (userData) localStorage.setItem("auth_user", JSON.stringify(userData));
    } catch (_) {}
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_role");
      localStorage.removeItem("auth_user");
    } catch (_) {}
  };

  const handleThemeSelect = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  // Rehydrate auth from localStorage and fetch user if missing
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("auth_token");
      const storedRole = localStorage.getItem("auth_role");
      const storedUser = localStorage.getItem("auth_user");
      if (storedToken && !token) setToken(storedToken);
      if (storedRole && !role) setRole(storedRole);
      if (storedUser && !user) setUser(JSON.parse(storedUser));
    } catch (_) {}
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      if (token && !user) {
        try {
          const res = await fetch("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data && data.id) {
            const userData = { id: data.id, name: data.name, email: data.email };
            setUser(userData);
            try { localStorage.setItem("auth_user", JSON.stringify(userData)); } catch (_) {}
          }
        } catch (_) {}
      }
    };
    fetchMe();
  }, [token, user]);

  return (
    <Router>
      <Layout role={role} token={token} onLogout={handleLogout} user={user}>
        <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route
              path="/login"
              element={
                token ? (
                  role === "admin" ? (
                    <Navigate to="/admin" />
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
              path="/my-registrations"
              element={
                token && role === "user" ? (
                  <UserRegistrations token={token} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/my-certificates"
              element={
                token && role === "user" ? (
                  <UserCertificatePage token={token} user={user} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            {/* Theme selection removed from flow */}
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
            <Route
              path="/admin/categories"
              element={
                token && role === "admin" ? (
                  <AdminCategoryList />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/admin/category/:cat"
              element={
                token && role === "admin" ? (
                  <AdminCategoryPage token={token} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/admin/category/:cat/create"
              element={
                token && role === "admin" ? (
                  <AdminCategoryCreate token={token} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/admin/certificates"
              element={
                token && role === "admin" ? (
                  <AdminCertificatePage token={token} />
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
      </Layout>
    </Router>
  );
}

export default App;
