import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminCategoryCreate({ token }) {
  const { cat } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          description,
          startAt: startAt ? new Date(startAt).toISOString() : null,
          endAt: endAt ? new Date(endAt).toISOString() : null,
          category: cat,
        }),
      });
      const data = await res.json();
      if (data.event) {
        alert("Event created");
        navigate(`/admin/category/${encodeURIComponent(cat)}`);
      } else alert(data.error || "Failed to create");
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-2 sm:p-4">
      <button onClick={() => navigate(-1)} className="text-purple-600 hover:text-purple-700 font-medium">← Back</button>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-4">Create {cat} Event</h1>
      <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-gray-200 max-w-xl">
        <input className="w-full p-3 border border-gray-300 rounded-lg mb-3" placeholder="Event title" value={title} onChange={(e)=>setTitle(e.target.value)} required />
        <input className="w-full p-3 border border-gray-300 rounded-lg mb-3" placeholder="Short description" value={description} onChange={(e)=>setDescription(e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input type="datetime-local" className="w-full p-3 border border-gray-300 rounded-lg" value={startAt} onChange={(e)=>setStartAt(e.target.value)} required />
          <input type="datetime-local" className="w-full p-3 border border-gray-300 rounded-lg" value={endAt} onChange={(e)=>setEndAt(e.target.value)} />
        </div>
        <button type="submit" className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Create {cat} Event</button>
      </form>
    </div>
  );
}





