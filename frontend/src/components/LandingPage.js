import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white text-center py-32 px-6 shadow-lg">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-xl"
        >
          🎉 Join Exciting Events Online
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-lg md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Connect, learn, and participate in events organized by top admins worldwide.
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          <Link
            to="/events"
            className="bg-white text-purple-700 font-semibold px-8 py-3 rounded-xl shadow-lg hover:scale-105 hover:bg-gray-100 transition-transform duration-300"
          >
            Explore Events
          </Link>
          <Link
            to="/signup"
            className="bg-green-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:scale-105 hover:bg-green-600 transition-transform duration-300"
          >
            Join Now
          </Link>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-20 text-center px-6 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-purple-700">
          About Our Platform
        </h2>
        <p className="text-gray-700 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
          Our platform allows users to explore and register for events created by verified admins.
          Admins can create events, track registrations, and manage participants seamlessly.
        </p>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-pink-600">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-md hover:scale-105 hover:shadow-xl transition duration-300">
            <CalendarDays className="mx-auto mb-4 text-purple-600 w-12 h-12" />
            <h3 className="font-bold text-xl mb-3 text-purple-600">Browse Events</h3>
            <p className="text-gray-700">Discover upcoming events that excite you.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md hover:scale-105 hover:shadow-xl transition duration-300">
            <Sparkles className="mx-auto mb-4 text-green-600 w-12 h-12" />
            <h3 className="font-bold text-xl mb-3 text-green-600">Quick Registration</h3>
            <p className="text-gray-700">Register instantly and secure your spot.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-md hover:scale-105 hover:shadow-xl transition duration-300">
            <Users className="mx-auto mb-4 text-pink-600 w-12 h-12" />
            <h3 className="font-bold text-xl mb-3 text-pink-600">For Admins</h3>
            <p className="text-gray-700">Create, manage, and track participants with ease.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
