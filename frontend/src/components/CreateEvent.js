import React, { useState } from "react";

function CreateEvent({ token, onEventCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
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
          date,
          guests: guests.split(",").map((g) => g.trim()),
        }),
      });
      const data = await res.json();
      if (data.event) {
        onEventCreated(data.event); // add to Dashboard state
        setTitle("");
        setDescription("");
        setDate("");
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
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="w-full p-2 border rounded mb-2"
      />
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
