import React from "react";

function EventCard({ event }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
      <h2 className="text-xl font-semibold">{event.title}</h2>
      <p className="text-gray-600">{event.description}</p>
      <p className="mt-2 text-gray-500">Date: {new Date(event.date).toLocaleDateString()}</p>
      <p className="mt-1 text-gray-500">Guests: {event.guests.join(", ") || "None"}</p>
    </div>
  );
}

export default EventCard;
