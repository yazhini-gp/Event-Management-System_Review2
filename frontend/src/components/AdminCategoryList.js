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
    <div className="p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-4">Categories</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/admin/category/${encodeURIComponent(cat)}`}
            className="p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">{iconFor(cat)}</div>
            <h3 className="font-medium text-gray-900">{cat}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}





