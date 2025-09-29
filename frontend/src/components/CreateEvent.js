import React, { useState } from "react";

function CreateEvent({ token, onEventCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("published");
  const [guests, setGuests] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
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
          timezone,
          location,
          status,
          guests: guests.split(",").map((g) => g.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.event) {
        onEventCreated && onEventCreated(data.event);
        setTitle("");
        setDescription("");
        setStartAt("");
        setEndAt("");
        setTimezone("UTC");
        setLocation("");
        setStatus("published");
        setGuests("");
        alert("Event created successfully!");
      } else {
        alert(data.error || "Failed to create event");
      }
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Create Event</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Enter event title" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Short description (optional)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start date & time</label>
          <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End date & time</label>
          <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="UTC">UTC</option>
            <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>{Intl.DateTimeFormat().resolvedOptions().timeZone}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Venue or meeting link (optional)" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
          <input type="text" value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Comma separated emails (optional)" />
          <p className="text-xs text-gray-500 mt-1">Guests will receive invitations after the event is created.</p>
        </div>
      </div>
      <div className="mt-6">
        <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50">
          {saving ? "Creating..." : "Create Event"}
        </button>
      </div>
    </form>
  );
}

export default CreateEvent;
