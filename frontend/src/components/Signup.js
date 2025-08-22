import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); 
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!role) return alert("Select your role!");

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.msg) {
        alert(data.msg);
        navigate("/login");
      } else alert(data.error || "Signup failed");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-purple-700">
          Signup
        </h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          className="w-full p-3 border rounded-lg mb-6 focus:ring-2 focus:ring-pink-500 focus:outline-none"
        >
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="w-full bg-green-500 text-white font-semibold p-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
        >
          Signup
        </button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-pink-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
