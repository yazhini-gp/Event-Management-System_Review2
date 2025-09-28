import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ThemeSelection({ token, onThemeSelect }) {
  const [theme, setTheme] = useState("");
  const navigate = useNavigate();

  const handleSelect = () => {
    if (!theme) return alert("Please select a theme!");
    try { localStorage.setItem('selectedTheme', theme); } catch(_) {}
    onThemeSelect(theme);
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Select a Category</h2>

        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        >
          <option value="">Select Category</option>
          <option value="Tech">Tech</option>
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
        </select>

        <button
          onClick={handleSelect}
          className="w-full bg-purple-600 text-white font-semibold p-3 rounded-lg hover:bg-purple-700 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
