import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Laptop, Music2, Dumbbell, Palette, Briefcase, GraduationCap, HeartPulse, Utensils, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeSelection({ token, onThemeSelect }) {
  const [theme, setTheme] = useState("");
  const navigate = useNavigate();

  const categories = [
    { key: 'Tech', label: 'Tech', icon: <Laptop className="w-6 h-6" /> },
    { key: 'Music', label: 'Music', icon: <Music2 className="w-6 h-6" /> },
    { key: 'Sports', label: 'Sports', icon: <Dumbbell className="w-6 h-6" /> },
    { key: 'Arts', label: 'Arts', icon: <Palette className="w-6 h-6" /> },
    { key: 'Business', label: 'Business', icon: <Briefcase className="w-6 h-6" /> },
    { key: 'Education', label: 'Education', icon: <GraduationCap className="w-6 h-6" /> },
    { key: 'Health', label: 'Health', icon: <HeartPulse className="w-6 h-6" /> },
    { key: 'Food', label: 'Food', icon: <Utensils className="w-6 h-6" /> },
  ];

  const handleSelect = () => {
    if (!theme) return alert("Please select a category!");
    try { localStorage.setItem('selectedTheme', theme); } catch(_) {}
    onThemeSelect(theme);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-500/10 text-purple-700 border border-purple-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Admin · Theme Selection
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-900">Choose your event category</h1>
          <p className="mt-2 text-gray-600">This helps personalize the dashboard and event recommendations.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((c, idx) => (
            <motion.button
              key={c.key}
              onClick={() => setTheme(c.key)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`p-5 rounded-2xl border text-left shadow-sm hover:shadow-lg transition-all ${
                theme === c.key ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${theme === c.key ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                {c.icon}
              </div>
              <div className="font-semibold text-gray-900">{c.label}</div>
              <div className="text-sm text-gray-600">Tailored events and analytics</div>
            </motion.button>
          ))}
        </div>

        <div className="mt-8 max-w-sm mx-auto">
          <button
            onClick={handleSelect}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold p-3 rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 transition"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
