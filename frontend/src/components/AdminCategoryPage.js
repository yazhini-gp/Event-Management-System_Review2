import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function AdminCategoryPage({ token }) {
  const { cat } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", startAt: "", endAt: "" });
  const [rsvpForEvent, setRsvpForEvent] = useState({}); // eventId -> { counts, list }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/admin-events?category=${encodeURIComponent(cat)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); setEvents([]); }
    })();
  }, [cat, token]);

  const refresh = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/admin-events?category=${encodeURIComponent(cat)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const startEdit = (ev) => {
    setEditingId(ev._id);
    setEditForm({
      title: ev.title || "",
      description: ev.description || "",
      startAt: ev.startAt ? new Date(ev.startAt).toISOString().slice(0, 16) : "",
      endAt: ev.endAt ? new Date(ev.endAt).toISOString().slice(0, 16) : "",
    });
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
          category: cat,
        }),
      });
      const data = await res.json();
      if (data.event) {
        setEditingId(null);
        await refresh();
      } else {
        alert(data.error || "Update failed");
      }
    } catch (e) { console.error(e); }
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
        await refresh();
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (e) { console.error(e); }
  };

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-purple-600 hover:text-purple-700 font-medium">← Back</button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{cat} Events</h1>
        </div>
        <Link to={`/admin/category/${encodeURIComponent(cat)}/create`} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Create {cat} Event</Link>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-600">No events yet in this category.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <div key={ev._id} className="bg-white p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{ev.title}</h3>
              <p className="text-gray-600">{ev.description}</p>
              <p className="text-sm text-gray-500 mt-1">📅 {ev.startAt ? new Date(ev.startAt).toLocaleString() : ''}</p>
              <p className="text-sm text-gray-500">👤 Created by: {ev.createdBy?.name} ({ev.createdBy?.email})</p>
              <p className="text-sm text-gray-500">📝 Registered Users: {ev.registeredUsers?.length || 0}</p>
              
              <div className="flex gap-2 mt-3">
                <button
                  className="px-3 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                  onClick={() => startEdit(ev)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => deleteEvent(ev._id)}
                >
                  Delete
                </button>
                <button
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={async () => {
                    const emails = prompt('Enter emails (comma separated)');
                    if (!emails) return;
                    const list = emails.split(',').map(x => x.trim()).filter(Boolean);
                    if (list.length === 0) return;
                    try {
                      const res = await fetch(`http://localhost:5000/api/invitations/${ev._id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ emails: list })
                      });
                      const data = await res.json();
                      if (data.msg) alert('Invitations sent'); else alert(data.error || 'Failed');
                    } catch (e) { console.error(e); }
                  }}
                >
                  Send Invites
                </button>
                <button
                  className="px-3 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
                  onClick={() => loadRsvp(ev._id)}
                >
                  Load RSVPs
                </button>
              </div>

              {ev.registeredUsers?.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Registered Users:</p>
                  <ul className="bg-gray-100 p-3 rounded-lg text-gray-700 text-sm">
                    {ev.registeredUsers.map((user) => (
                      <li key={user._id} className="mb-1">
                        {user.name} ({user.email})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rsvpForEvent[ev._id]?.counts && (
                <div className="mt-3 text-sm text-gray-700">
                  <p>RSVPs: Going {rsvpForEvent[ev._id].counts.going || 0} · Maybe {rsvpForEvent[ev._id].counts.maybe || 0} · Not going {rsvpForEvent[ev._id].counts.not_going || 0}</p>
                  {Array.isArray(rsvpForEvent[ev._id].rsvps) && rsvpForEvent[ev._id].rsvps.length > 0 && (
                    <ul className="mt-2 bg-gray-50 p-2 rounded">
                      {rsvpForEvent[ev._id].rsvps.map((r) => (
                        <li key={r._id}>{r.user?.name || r.user?.email}: {r.status}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {editingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-2">Edit Event</h3>
            <input
              className="w-full p-2 border border-gray-300 rounded mb-2"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
            <textarea
              className="w-full p-2 border border-gray-300 rounded mb-2"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="datetime-local"
                className="w-full p-2 border border-gray-300 rounded"
                value={editForm.startAt}
                onChange={(e) => setEditForm({ ...editForm, startAt: e.target.value })}
              />
              <input
                type="datetime-local"
                className="w-full p-2 border border-gray-300 rounded"
                value={editForm.endAt}
                onChange={(e) => setEditForm({ ...editForm, endAt: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1" onClick={() => setEditingId(null)}>Cancel</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


