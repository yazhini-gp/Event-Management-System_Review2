import React, { useEffect, useState } from "react";

export default function AdminDashboard({ token, onLogout }) {
  const [events, setEvents] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  // Fetch events created by admin
  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events/admin-events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

  // Create new event
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, date }),
      });
      const data = await res.json();
      if (data.event) {
        alert("Event created successfully!");
        setTitle("");
        setDescription("");
        setDate("");
        setShowCreate(false);
        fetchEvents();
      } else {
        alert(data.error || "Failed to create event");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate stats
  const totalRegistrations = events.reduce(
    (sum, ev) => sum + (ev.registeredUsers?.length || 0),
    0
  );
  const mostPopularEvent =
    events.length > 0
      ? events.reduce((max, ev) =>
          (ev.registeredUsers?.length || 0) >
          (max.registeredUsers?.length || 0)
            ? ev
            : max
        )
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
          Admin Dashboard
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
          <h3 className="text-lg font-semibold text-purple-700">Total Registrations</h3>
          <p className="text-3xl font-bold">{totalRegistrations}</p>
        </div>
        
      </div>

      {/* Create Event Form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-2xl shadow-lg mb-6 max-w-md"
        >
          <h2 className="font-bold text-xl mb-4 text-purple-700">
            Create Event
          </h2>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            required
          />
          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
          >
            Create Event
          </button>
        </form>
      )}

      {!showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-500 text-white px-5 py-2 rounded-lg mb-6 shadow-md hover:bg-blue-600 transition duration-300"
        >
          ➕ Add New Event
        </button>
      )}

      {/* Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <p className="text-white font-semibold text-lg">
            No events created yet.
          </p>
        ) : (
          events.map((ev) => (
            <div
              key={ev._id}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
            >
              <h2 className="text-2xl font-bold text-purple-700 mb-2">
                {ev.title}
              </h2>
              <p className="text-gray-600 mb-2">{ev.description}</p>
              <p className="text-sm text-gray-500 mb-1">
                📅 {new Date(ev.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                👤 Created by: {ev.createdBy?.name} ({ev.createdBy?.email})
              </p>
              <p className="text-sm text-gray-500 mb-2">
                📝 Registered Users: {ev.registeredUsers?.length || 0}
              </p>

              {ev.registeredUsers?.length > 0 && (
                <ul className="bg-gray-100 p-3 rounded-lg text-gray-700 text-sm">
                  {ev.registeredUsers.map((user) => (
                    <li key={user._id} className="mb-1">
                      {user.name} ({user.email})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
