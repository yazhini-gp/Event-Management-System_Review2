import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ThemeSelection({ token, onThemeSelect }) {
  const [theme, setTheme] = useState("");
  const navigate = useNavigate();

  const handleSelect = () => {
    if (!theme) return alert("Please select a theme!");
    onThemeSelect(theme);
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        <h2 className="text-3xl font-extrabold mb-6 text-purple-700">Select a Theme</h2>

        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full p-3 border rounded-lg mb-6 focus:ring-2 focus:ring-pink-500 focus:outline-none"
        >
          <option value="">Select Theme</option>
          <option value="coding">Coding Events</option>
          <option value="workshops">Workshops</option>
          <option value="seminars">Seminars</option>
        </select>

        <button
          onClick={handleSelect}
          className="w-full bg-green-500 text-white font-semibold p-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
