import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard({ token, onLogout }) {
  const [events, setEvents] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", startAt: "", endAt: "" });
  const [category, setCategory] = useState("");

  const categories = ["Tech", "Music", "Sports", "Education", "Business", "Health", "Arts", "Food"];

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

  const startEdit = (ev) => {
    setEditingId(ev._id);
    setEditForm({
      title: ev.title || "",
      description: ev.description || "",
      startAt: ev.startAt ? new Date(ev.startAt).toISOString().slice(0, 16) : "",
      endAt: ev.endAt ? new Date(ev.endAt).toISOString().slice(0, 16) : "",
    });
    setCategory(ev.category || "");
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          startAt: editForm.startAt ? new Date(editForm.startAt).toISOString() : null,
          endAt: editForm.endAt ? new Date(editForm.endAt).toISOString() : null,
          category: category || null,
        }),
      });
      const data = await res.json();
      if (data.event) {
        setEditingId(null);
        fetchEvents();
      } else {
        alert(data.error || "Update failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.msg) {
        fetchEvents();
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (e) {
      console.error(e);
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
        body: JSON.stringify({
          title,
          description,
          startAt: startAt ? new Date(startAt).toISOString() : null,
          endAt: endAt ? new Date(endAt).toISOString() : null,
          category: selectedCategory,
        }),
      });
      const data = await res.json();
      if (data.event) {
        alert("Event created successfully!");
        setTitle("");
        setDescription("");
        setStartAt("");
        setEndAt("");
        setShowCreate(false);
        setSelectedCategory(null);
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

  const [rsvpForEvent, setRsvpForEvent] = useState({}); // eventId -> { counts, list }

  const loadRsvp = async (eventId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/rsvps/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data && data.counts) {
        setRsvpForEvent((prev) => ({ ...prev, [eventId]: data }));
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-2 sm:p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
          <h3 className="text-sm font-medium text-gray-600">Total Events</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{events.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
          <h3 className="text-sm font-medium text-gray-600">Total Registrations</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{totalRegistrations}</p>
        </div>
      </div>

      {/* Admin Tools */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/admin/certificates" className="p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-medium text-gray-900">Certificate Management</h3>
            <p className="text-sm text-gray-600 mt-1">Manage digital certificates and signatures</p>
          </Link>
          <div className="p-6 bg-white border border-gray-200 rounded-xl">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-medium text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">Event performance metrics (Coming Soon)</p>
          </div>
        </div>
      </div>

      {/* Category Selection (links to dedicated pages) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat} to={`/admin/category/${encodeURIComponent(cat)}`} className="p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors text-center">
              <div className="text-2xl mb-2">
                {cat === 'Tech' && '💻'}
                {cat === 'Music' && '🎵'}
                {cat === 'Sports' && '⚽'}
                {cat === 'Education' && '📚'}
                {cat === 'Business' && '💼'}
                {cat === 'Health' && '🏥'}
                {cat === 'Arts' && '🎨'}
                {cat === 'Food' && '🍕'}
              </div>
              <h3 className="font-medium text-gray-900">{cat}</h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Back to Categories */}
      {selectedCategory && (
        <div className="mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Categories
          </button>
          <h2 className="text-xl font-semibold text-gray-900 mt-2">Create {selectedCategory} Event</h2>
        </div>
      )}

      {/* Create Event Form (kept for quick use if selectedCategory is set) */}
      {selectedCategory && showCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-xl border border-gray-200 mb-6 max-w-xl"
        >
          <h2 className="font-bold text-xl mb-4 text-purple-700">
            Create {selectedCategory} Event
          </h2>
          <input
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Create {selectedCategory} Event
          </button>
        </form>
      )}

      {selectedCategory && !showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg mb-6 hover:bg-purple-700 transition"
        >
          ➕ Create {selectedCategory} Event
        </button>
      )}

      {/* Events are now shown only on the category page (/admin/category/:cat) */}
    </div>
  );
}

