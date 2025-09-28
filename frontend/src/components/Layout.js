import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Layout({ children, role, token, onLogout, user }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="inline-block h-8 w-8 rounded-lg bg-gradient-to-tr from-fuchsia-600 to-purple-600" />
              <span className="font-extrabold tracking-tight text-lg">Evently</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 ml-6">
              <Link to="/" className={`text-sm font-medium ${isActive('/') ? 'text-purple-700' : 'text-gray-600 hover:text-gray-800'}`}>Home</Link>
              {token && role === 'user' && (
                <>
                  <Link to="/dashboard" className={`text-sm font-medium ${isActive('/dashboard') ? 'text-purple-700' : 'text-gray-600 hover:text-gray-800'}`}>My Dashboard</Link>
                  <Link to="/my-registrations" className={`text-sm font-medium ${isActive('/my-registrations') ? 'text-purple-700' : 'text-gray-600 hover:text-gray-800'}`}>My Events</Link>
                  <Link to="/my-certificates" className={`text-sm font-medium ${isActive('/my-certificates') ? 'text-purple-700' : 'text-gray-600 hover:text-gray-800'}`}>My Certificates</Link>
                </>
              )}
              {token && role === 'admin' && (
                <Link to="/admin" className={`text-sm font-medium ${isActive('/admin') ? 'text-purple-700' : 'text-gray-600 hover:text-gray-800'}`}>Admin</Link>
              )}
              <Link to="/about" className={`text-sm font-medium ${isActive('/about') ? 'text-purple-700' : 'text-gray-600 hover:text-gray-800'}`}>About</Link>
              <Link to="/faq" className={`text-sm font-medium ${isActive('/faq') ? 'text-purple-700' : 'text-gray-600 hover:text-gray-800'}`}>FAQ</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {token && (user?.name || user?.email) && (
              <details className="hidden sm:block">
                <summary className="list-none cursor-pointer flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg select-none">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name || 'User'}</span>
                  <span className="text-xs text-gray-500">({role})</span>
                </summary>
                <div className="absolute right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow p-3 text-sm text-gray-700">
                  <p className="mb-2"><span className="font-medium">Email:</span> {user.email}</p>
                  <button onClick={onLogout} className="w-full text-left text-red-600 hover:text-red-700">Logout</button>
                </div>
              </details>
            )}
            {!token ? (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Log in</Link>
                <Link to="/signup" className="px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700">Sign up</Link>
              </>
            ) : (
              <button onClick={onLogout} className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">Logout</button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="mt-10 border-t border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-500 flex items-center justify-between">
          <p>© {new Date().getFullYear()} Evently. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/feedback" className="hover:text-gray-700">Feedback</Link>
            <Link to="/gallery" className="hover:text-gray-700">Gallery</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


