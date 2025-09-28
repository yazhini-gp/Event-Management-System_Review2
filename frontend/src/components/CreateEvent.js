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
          timezone,
          location,
          status,
          guests: guests.split(",").map((g) => g.trim()),
        }),
      });
      const data = await res.json();
      if (data.event) {
        onEventCreated(data.event); // add to Dashboard state
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
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Create Event</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full p-2 border rounded mb-2"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        <input
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="datetime-local"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <input
        type="text"
        placeholder="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <div className="grid grid-cols-2 gap-2 mb-2">
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="UTC">UTC</option>
          <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <input
        type="text"
        placeholder="Guests (comma separated emails)"
        value={guests}
        onChange={(e) => setGuests(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Create Event
      </button>
    </form>
  );
}

export default CreateEvent;
