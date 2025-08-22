import React, { useEffect, useState } from "react";

export default function Dashboard({ token, onLogout }) {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events/my-registrations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRegisteredEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setRegisteredEvents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/events/register/${eventId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.msg) {
        alert("Registered successfully!");
        fetchEvents();
        fetchRegisteredEvents();
      } else alert(data.error || "Registration failed");
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const upcomingEvents = events.filter(
    (ev) => new Date(ev.date) >= new Date()
  );
  const featuredEvent =
    upcomingEvents.length > 0
      ? upcomingEvents.reduce((soonest, ev) =>
          new Date(ev.date) < new Date(soonest.date) ? ev : soonest
        )
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
          User Dashboard
        </h1>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-600 transition duration-300"
        >
          Logout
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <h3 className="text-lg font-semibold text-purple-700">Total Events</h3>
          <p className="text-3xl font-bold">{events.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <h3 className="text-lg font-semibold text-purple-700">Upcoming Events</h3>
          <p className="text-3xl font-bold">{upcomingEvents.length}</p>
        </div>
      </div>

      {/* Featured Event */}
      {featuredEvent && (
        <div className="bg-white p-6 mb-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-purple-700 mb-2">🌟 Featured Event</h2>
          <p className="text-2xl font-semibold mb-1">{featuredEvent.title}</p>
          <p className="text-gray-600 mb-2">{featuredEvent.description}</p>
          <p className="text-sm text-gray-500">
            📅 {new Date(featuredEvent.date).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((ev) => (
            <div
              key={ev._id}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
            >
              <h2 className="text-2xl font-bold text-purple-700 mb-2">
                {ev.title}
              </h2>
              {ev.description && (
                <p className="text-gray-600 mb-3">{ev.description}</p>
              )}
              <p className="text-sm text-gray-500 mb-4">
                📅 {new Date(ev.date).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleRegister(ev._id)}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
              >
                Register
              </button>
            </div>
          ))
        ) : (
          <p className="text-white text-lg font-semibold">
            No events available yet.
          </p>
        )}
      </div>
    </div>
  );
}
