import React from "react";

function EventCard({ event, onEdit, onDelete, onRSVP }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
      <h2 className="text-xl font-semibold">{event.title}</h2>
      <p className="text-gray-600">{event.description}</p>
      <p className="mt-2 text-gray-500">
        {event.startAt ? `Starts: ${new Date(event.startAt).toLocaleString()}` : event.date ? `Date: ${new Date(event.date).toLocaleString()}` : ""}
      </p>
      <p className="mt-1 text-gray-500">Guests: {event.guests.join(", ") || "None"}</p>
      <div className="flex gap-2 mt-3">
        {onEdit && (
          <button className="px-3 py-1 bg-yellow-500 text-white rounded" onClick={() => onEdit(event)}>Edit</button>
        )}
        {onDelete && (
          <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => onDelete(event._id)}>Delete</button>
        )}
        {onRSVP && (
          <>
            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => onRSVP(event._id, "going")}>Going</button>
            <button className="px-3 py-1 bg-gray-500 text-white rounded" onClick={() => onRSVP(event._id, "maybe")}>Maybe</button>
            <button className="px-3 py-1 bg-slate-600 text-white rounded" onClick={() => onRSVP(event._id, "not_going")}>Not going</button>
          </>
        )}
      </div>
    </div>
  );
}

export default EventCard;
