import React from "react";

export default function FAQPage() {
  const faqs = [
    { question: "How do I register for an event?", answer: "Click on 'Explore Events' and select the event to register." },
    { question: "Can I cancel my registration?", answer: "Currently, you cannot cancel once registered." },
    { question: "How do admins create events?", answer: "Admins can login and use the Admin Dashboard to create events." },
  ];

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-20 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500
">
      <h1 className="text-4xl font-bold text-purple-700 mb-12 text-center">FAQ</h1>
      <div className="max-w-4xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="font-bold text-xl text-purple-700 mb-2">{faq.question}</h3>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
