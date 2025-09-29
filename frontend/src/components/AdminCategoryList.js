import React from "react";
import { Link } from "react-router-dom";

export default function AdminCategoryList() {
  const categories = ["Tech", "Music", "Sports", "Education", "Business", "Health", "Arts", "Food"];
  const iconFor = (cat) => (
    cat === 'Tech' ? '💻' :
    cat === 'Music' ? '🎵' :
    cat === 'Sports' ? '⚽' :
    cat === 'Education' ? '📚' :
    cat === 'Business' ? '💼' :
    cat === 'Health' ? '🏥' :
    cat === 'Arts' ? '🎨' :
    '🍕'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Categories</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/admin/category/${encodeURIComponent(cat)}`}
              className="p-6 bg-white rounded-2xl shadow border border-gray-100 hover:shadow-lg transition text-center"
            >
              <div className="text-3xl mb-3">{iconFor(cat)}</div>
              <h3 className="font-semibold text-gray-900">{cat}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}







