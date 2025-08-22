import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!role) return alert("Select your role!");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (data.token && data.role === role) {
        onLogin(data.token, data.role);
        role === "admin" ? navigate("/admin") : navigate("/dashboard");
      } else alert(data.error || "Login failed");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-purple-700">
          Login
        </h2>

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
          Login
        </button>

        <p className="mt-4 text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-pink-600 font-semibold hover:underline">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}
