import React, { useEffect, useState } from "react";

export default function Dashboard({ token, onLogout }) {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", startAt: "", endAt: "", guests: "" });
  const [me, setMe] = useState(null);
  const [inviteEmails, setInviteEmails] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [myRsvp, setMyRsvp] = useState({}); // eventId -> 'going' | 'maybe' | 'not_going'
  const [rsvpSaving, setRsvpSaving] = useState({}); // eventId -> boolean
  const categories = ["All", "Tech", "Music", "Sports", "Education", "Business", "Health", "Arts", "Food"];
  const [selectedCat, setSelectedCat] = useState('All');

  const fetchEvents = async () => {
    try {
      // Filter by selected theme/category if present
      const params = new URLSearchParams();
      const cat = selectedCat === 'All' ? null : selectedCat;
      if (cat) params.set('category', cat);
      const url = `http://localhost:5000/api/events/${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, {
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
    (async ()=>{
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", { headers: { Authorization: `Bearer ${token}` }});
        const data = await res.json();
        if (data && data.id) setMe(data);
      } catch(e){}
    })();
    (async ()=>{
      try{
        const res = await fetch("http://localhost:5000/api/recommendations", { headers: { Authorization: `Bearer ${token}` }});
        const data = await res.json();
        if (Array.isArray(data)) setRecommendations(data);
      }catch(e){}
    })();
    const ev = new EventSource("http://localhost:5000/api/realtime/events");
    ev.onmessage = (m)=>{
      try{ const data = JSON.parse(m.data); if (data.type === "rsvp:update") { fetchEvents(); } }catch(_){ }
    };
    return ()=>{ ev.close(); };
  }, [selectedCat]);

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

  const handleRSVP = async (eventId, status) => {
    try {
      setRsvpSaving((s) => ({ ...s, [eventId]: true }));
      const res = await fetch(`http://localhost:5000/api/rsvps/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.msg) {
        setMyRsvp((m) => ({ ...m, [eventId]: status }));
        fetchEvents();
      } else alert(data.error || "RSVP failed");
    } catch (e) { console.error(e); }
    finally {
      setRsvpSaving((s) => ({ ...s, [eventId]: false }));
    }
  };

  const startEdit = (ev) => {
    setEditing(ev._id);
    setEditForm({
      title: ev.title || "",
      description: ev.description || "",
      startAt: ev.startAt ? new Date(ev.startAt).toISOString().slice(0,16) : "",
      endAt: ev.endAt ? new Date(ev.endAt).toISOString().slice(0,16) : "",
      guests: (ev.guests || []).join(", "),
    });
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/events/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          startAt: editForm.startAt ? new Date(editForm.startAt).toISOString() : null,
          endAt: editForm.endAt ? new Date(editForm.endAt).toISOString() : null,
          guests: editForm.guests.split(",").map((g) => g.trim()),
        }),
      });
      const data = await res.json();
      if (data.event) {
        setEditing(null);
        fetchEvents();
      } else alert(data.error || "Update failed");
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
        fetchEvents();
      } else alert(data.error || "Delete failed");
    } catch (e) { console.error(e); }
  };

  // Stats
  const upcomingEvents = events.filter(
    (ev) => new Date(ev.startAt || ev.date) >= new Date()
  );
  const featuredEvent =
    upcomingEvents.length > 0
      ? upcomingEvents.reduce((soonest, ev) =>
          new Date(ev.date) < new Date(soonest.date) ? ev : soonest
        )
      : null;

  return (
    <div className="p-2 sm:p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">My Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
          <h3 className="text-sm font-medium text-gray-600">Total Events</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{events.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
          <h3 className="text-sm font-medium text-gray-600">Upcoming Events</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{upcomingEvents.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
          <h3 className="text-sm font-medium text-gray-600">My Certificates</h3>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            <a href="/my-certificates" className="text-blue-600 hover:text-blue-800">View All</a>
          </p>
        </div>
      </div>

      {/* Featured Event */}
      {featuredEvent && (
        <div className="bg-white p-5 mb-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">🌟 Featured Event</h2>
          <p className="text-2xl font-semibold mb-1">{featuredEvent.title}</p>
          <p className="text-gray-600 mb-2">{featuredEvent.description}</p>
          <p className="text-sm text-gray-500">
            📅 {new Date(featuredEvent.startAt || featuredEvent.date).toLocaleString(undefined, { timeZoneName: 'short' })}
          </p>
        </div>
      )}

      {/* Category filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} onClick={()=>setSelectedCat(c)} className={`px-3 py-1 rounded-full text-sm ${selectedCat===c? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{c}</button>
        ))}
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.length > 0 ? (
          events.map((ev) => (
            <div
              key={ev._id}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-sm transition"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {ev.title}
              </h2>
              {ev.description && (
                <p className="text-gray-600 mb-3">{ev.description}</p>
              )}
              <p className="text-sm text-gray-500 mb-4">
                {ev.startAt ? `📅 ${new Date(ev.startAt).toLocaleString(undefined, { timeZoneName: 'short' })}` : ev.date ? `📅 ${new Date(ev.date).toLocaleString(undefined, { timeZoneName: 'short' })}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleRegister(ev._id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Register
                </button>
                {me && ev.registeredUsers && ev.registeredUsers.some((u)=> (typeof u === 'object' ? u._id : u) === me.id) && (
                  <button
                    onClick={() => {
                      window.open(`http://localhost:5000/api/certificates/${ev._id}/${me.id}`, '_blank');
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    🏆 Get Certificate
                  </button>
                )}
                {me && ((typeof ev.createdBy === 'object' ? ev.createdBy._id : ev.createdBy) === me.id) && (
                  <>
                    <button
                      onClick={() => startEdit(ev)}
                      className="bg-amber-500 text-white px-3 py-2 rounded hover:bg-amber-600"
                    >Edit</button>
                    <button
                      onClick={() => deleteEvent(ev._id)}
                      className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                    >Delete</button>
                  </>
                )}
              </div>
              {me && ev.createdBy === me.id && (
                <div className="mt-3">
                  <div className="flex gap-2">
                    <input className="flex-1 p-2 border border-gray-300 rounded" placeholder="Invite emails (comma separated)" value={inviteEmails} onChange={(e)=>setInviteEmails(e.target.value)} />
                    <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={async ()=>{
                      const emails = inviteEmails.split(',').map(x=>x.trim()).filter(Boolean);
                      if (emails.length===0) return alert('Add emails');
                      const res = await fetch(`http://localhost:5000/api/invitations/${ev._id}`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ emails }) });
                      const data = await res.json();
                      if (data.msg) { alert('Invitations created'); setInviteEmails(''); } else alert(data.error||'Failed');
                    }}>Send Invites</button>
                  </div>
                  <div className="mt-2 space-y-2">
                    <button className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 w-full" onClick={()=>{
                      window.open(`http://localhost:5000/api/certificates/${ev._id}/${me.id}`, '_blank');
                    }}>Generate & Download My Certificate</button>
                    <p className="text-xs text-gray-500">This will create a certificate record and download the PDF</p>
                  </div>
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  className={`px-3 py-1 rounded text-white ${myRsvp[ev._id]==="going" ? "bg-green-700" : "bg-green-600"}`}
                  disabled={!!rsvpSaving[ev._id]}
                  onClick={() => handleRSVP(ev._id, "going")}
                >
                  {myRsvp[ev._id]==="going" ? "Going ✓" : (rsvpSaving[ev._id] ? "Saving..." : "Going")}
                </button>
                <button
                  className={`px-3 py-1 rounded text-white ${myRsvp[ev._id]==="maybe" ? "bg-gray-700" : "bg-gray-500"}`}
                  disabled={!!rsvpSaving[ev._id]}
                  onClick={() => handleRSVP(ev._id, "maybe")}
                >
                  {myRsvp[ev._id]==="maybe" ? "Maybe ✓" : (rsvpSaving[ev._id] ? "Saving..." : "Maybe")}
                </button>
                <button
                  className={`px-3 py-1 rounded text-white ${myRsvp[ev._id]==="not_going" ? "bg-slate-800" : "bg-slate-600"}`}
                  disabled={!!rsvpSaving[ev._id]}
                  onClick={() => handleRSVP(ev._id, "not_going")}
                >
                  {myRsvp[ev._id]==="not_going" ? "Not going ✓" : (rsvpSaving[ev._id] ? "Saving..." : "Not going")}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white text-lg font-semibold">
            No events available yet.
          </p>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white p-6 my-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-purple-700 mb-2">Recommended for you</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((ev) => (
              <div key={ev._id} className="p-4 border rounded">
                <p className="font-semibold">{ev.title}</p>
                <p className="text-sm text-gray-500">{ev.startAt ? new Date(ev.startAt).toLocaleString() : ""}</p>
                <button className="mt-2 px-3 py-1 bg-green-600 text-white rounded" onClick={() => handleRegister(ev._id)}>Register</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded shadow w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-2">Edit Event</h3>
            <input className="w-full p-2 border rounded mb-2" value={editForm.title} onChange={(e)=>setEditForm({...editForm, title:e.target.value})} />
            <textarea className="w-full p-2 border rounded mb-2" value={editForm.description} onChange={(e)=>setEditForm({...editForm, description:e.target.value})} />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input type="datetime-local" className="w-full p-2 border rounded" value={editForm.startAt} onChange={(e)=>setEditForm({...editForm, startAt:e.target.value})} />
              <input type="datetime-local" className="w-full p-2 border rounded" value={editForm.endAt} onChange={(e)=>setEditForm({...editForm, endAt:e.target.value})} />
            </div>
            <input className="w-full p-2 border rounded mb-2" placeholder="Guests (comma separated)" value={editForm.guests} onChange={(e)=>setEditForm({...editForm, guests:e.target.value})} />
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1" onClick={()=>setEditing(null)}>Cancel</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
