import React from "react";

export default function AboutPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white text-center">
      <div className="border-4 border-white rounded-2xl p-8 max-w-xl bg-white/10 backdrop-blur-md">
        <h1 className="text-4xl font-bold mb-4">About This App</h1>
        <p className="text-lg mb-2">
          Welcome to our Event Management App! Here you can explore events, register, and have fun.
        </p>
        <p className="text-lg">
          This frontend-only demo showcases React, routing, UI components, and user-friendly interactions.
        </p>
      </div>
    </div>
  );
}
