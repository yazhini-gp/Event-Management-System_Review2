import React from "react";

export default function FeedbackPage() {
  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-white px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500
 text-center">
      <h1 className="text-4xl font-bold text-purple-700 mb-6">Feedback</h1>
      <p className="text-gray-700 mb-6 max-w-2xl">
        We would love to hear your thoughts! Share your feedback about our platform and events.
      </p>
      <textarea
        className="w-full max-w-xl p-4 border-2 border-purple-300 rounded-lg mb-4 focus:outline-none focus:border-purple-500"
        rows={6}
        placeholder="Write your feedback here..."
      ></textarea>
      <button className="bg-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-purple-800 transition duration-300">
        Submit
      </button>
    </div>
  );
}
