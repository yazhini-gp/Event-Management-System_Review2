import React from "react";

export default function GalleryPage() {
  const images = [
    "https://source.unsplash.com/400x300/?event",
    "https://source.unsplash.com/400x300/?conference",
    "https://source.unsplash.com/400x300/?workshop",
    "https://source.unsplash.com/400x300/?seminar",
    "https://source.unsplash.com/400x300/?party",
  ];

  return (
    <div className="py-20 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <h1 className="text-4xl font-bold text-purple-700 mb-10 text-center">Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Gallery ${index}`}
            className="w-full h-64 object-cover rounded-2xl shadow-md hover:scale-105 transition duration-300"
          />
        ))}
      </div>
    </div>
  );
}
