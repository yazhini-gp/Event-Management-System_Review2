import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, BarChart3, Trophy, Plus, Edit3, Trash2, FolderKanban } from "lucide-react";
import { motion } from "framer-motion";

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

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events/admin-events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
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
    } catch (e) {}
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
    } catch (e) {}
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

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
    } catch (err) {}
  };

  const totalRegistrations = events.reduce((sum, ev) => sum + (ev.registeredUsers?.length || 0), 0);
  const upcomingEvents = events.filter((ev) => new Date(ev.startAt || ev.date) >= new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage events, categories, and certificates</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/admin/categories" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700">
              <FolderKanban className="w-4 h-4 mr-2" />
              Manage Categories
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{events.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Registrations</p>
                <p className="text-3xl font-bold text-gray-900">{totalRegistrations}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-3xl font-bold text-gray-900">{upcomingEvents.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Admin Tools */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/admin/certificates" className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="flex items-center mb-2">
                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="font-semibold text-gray-900">Certificate Management</h3>
              </div>
              <p className="text-sm text-gray-600">Generate and manage digital certificates</p>
            </Link>
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Analytics</h3>
              </div>
              <p className="text-sm text-gray-600">Event performance metrics (Coming Soon)</p>
            </div>
          </div>
        </div>

        {/* Categories grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat} to={`/admin/category/${encodeURIComponent(cat)}`} className="p-6 bg-white rounded-2xl shadow border border-gray-100 hover:shadow-lg transition text-center">
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

        {/* Quick Create for selected category */}
        {selectedCategory && (
          <div className="mb-6">
            <button onClick={() => setSelectedCategory(null)} className="text-purple-600 hover:text-purple-700 font-medium">← Back to Categories</button>
            <h2 className="text-xl font-semibold text-gray-900 mt-2">Create {selectedCategory} Event</h2>
          </div>
        )}

        {selectedCategory && showCreate && (
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6 max-w-xl">
            <h2 className="font-bold text-xl mb-4 text-purple-700">Create {selectedCategory} Event</h2>
            <div className="space-y-3">
              <input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
              <input placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition">
                Create {selectedCategory} Event
              </button>
            </div>
          </form>
        )}

        {selectedCategory && !showCreate && (
          <button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-lg mb-6 hover:from-purple-700 hover:to-pink-700">
            <Plus className="w-4 h-4 inline-block mr-2" /> Create {selectedCategory} Event
          </button>
        )}
      </div>
    </div>
  );
}

