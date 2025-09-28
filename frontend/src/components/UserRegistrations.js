import React, { useEffect, useState } from "react";

export default function UserRegistrations({ token }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events/my-registrations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); setEvents([]); }
      finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-4">My Registered Events</h1>
      {events.length === 0 ? (
        <p className="text-gray-600">You haven't registered for any events yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <div key={ev._id} className="bg-white p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{ev.title}</h3>
              <p className="text-gray-600">{ev.description}</p>
              <p className="text-sm text-gray-500 mt-1">📅 {ev.startAt ? new Date(ev.startAt).toLocaleString() : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}





