import React, { useEffect, useState } from "react";
import { Calendar, Users, Award, TrendingUp, Clock, MapPin, Filter, Search, Star, Download, Edit, Trash2, Send, Plus, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

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
  const [userCertificates, setUserCertificates] = useState({}); // eventId -> certificate exists
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

  // Function to check if user has certificate for an event
  const checkUserCertificate = async (eventId, userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/certificates/exists/${eventId}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        return data.exists;
      }
      return false;
    } catch (error) {
      console.error('Error checking certificate:', error);
      return false;
    }
  };

  // Check certificates for all registered events
  const checkCertificates = async () => {
    if (!me || !me.id) return;
    
    const certificates = {};
    const registeredEvents = events.filter(event => 
      event.registeredUsers && event.registeredUsers.some((u)=> (typeof u === 'object' ? u._id : u) === me.id)
    );
    
    // Check certificates with a small delay to prevent rate limiting
    for (let i = 0; i < registeredEvents.length; i++) {
      const event = registeredEvents[i];
      const hasCert = await checkUserCertificate(event._id, me.id);
      certificates[event._id] = hasCert;
      
      // Add small delay to prevent rate limiting
      if (i < registeredEvents.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setUserCertificates(certificates);
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

  // Check certificates when events or user changes
  useEffect(() => {
    if (events.length > 0 && me && me.id) {
      checkCertificates();
    }
  }, [events, me]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Welcome back!</h1>
              <p className="text-gray-600">Here's what's happening with your events today.</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{events.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900">{upcomingEvents.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <Users className="w-4 h-4 mr-1" />
              <span>Ready to attend</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">My Certificates</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Object.values(userCertificates).filter(Boolean).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <a href="/my-certificates" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View All Certificates →
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Registered Events</p>
                <p className="text-3xl font-bold text-gray-900">{registeredEvents.length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600">
              <Users className="w-4 h-4 mr-1" />
              <span>Active participation</span>
            </div>
          </div>
        </motion.div>

        {/* Featured Event */}
        {featuredEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl text-white mb-8 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <Star className="w-6 h-6 mr-2 text-yellow-300" />
                  <h2 className="text-xl font-bold">Featured Event</h2>
                </div>
                <h3 className="text-3xl font-bold mb-3">{featuredEvent.title}</h3>
                <p className="text-purple-100 mb-4 text-lg">{featuredEvent.description}</p>
                <div className="flex items-center text-purple-200">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="text-lg">
                    {new Date(featuredEvent.startAt || featuredEvent.date).toLocaleString(undefined, { timeZoneName: 'short' })}
                  </span>
                </div>
              </div>
              <div className="ml-6">
                <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200">
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-lg mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by category:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCat(c)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCat === c
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Events List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length > 0 ? (
              events.map((ev, index) => (
                <motion.div
                  key={ev._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                        {ev.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        new Date(ev.startAt || ev.date) > new Date()
                          ? 'bg-blue-100 text-blue-800'
                          : new Date(ev.endAt || ev.startAt || ev.date) < new Date()
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {new Date(ev.startAt || ev.date) > new Date()
                          ? 'Upcoming'
                          : new Date(ev.endAt || ev.startAt || ev.date) < new Date()
                          ? 'Completed'
                          : 'Ongoing'}
                      </span>
                    </div>
                    
                    {ev.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{ev.description}</p>
                    )}
                    
                    <div className="flex items-center text-gray-500 mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {ev.startAt ? new Date(ev.startAt).toLocaleString(undefined, { timeZoneName: 'short' }) : ev.date ? new Date(ev.date).toLocaleString(undefined, { timeZoneName: 'short' }) : ""}
                      </span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {/* Registration Button */}
                      {me && ev.registeredUsers && ev.registeredUsers.some((u)=> (typeof u === 'object' ? u._id : u) === me.id) ? (
                        <button
                          disabled
                          className="w-full bg-gray-100 text-gray-500 px-4 py-3 rounded-xl cursor-not-allowed font-medium flex items-center justify-center"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Registered
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(ev._id)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                        >
                          Register Now
                        </button>
                      )}
                      
                      {/* Certificate Button */}
                      {me && ev.registeredUsers && ev.registeredUsers.some((u)=> (typeof u === 'object' ? u._id : u) === me.id) && userCertificates[ev._id] && (
                        <button
                          onClick={() => {
                            if (!ev._id || !me.id) {
                              alert('Error: Missing event or user information');
                              return;
                            }
                            const url = `http://localhost:5000/api/certificates/${ev._id}/${me.id}`;
                            window.open(url, '_blank');
                          }}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center"
                          title="Download your certificate"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Get Certificate
                        </button>
                      )}
                      {me && ev.registeredUsers && ev.registeredUsers.some((u)=> (typeof u === 'object' ? u._id : u) === me.id) && !userCertificates[ev._id] && (
                        <button
                          disabled
                          className="w-full bg-gray-100 text-gray-400 px-4 py-3 rounded-xl cursor-not-allowed font-medium flex items-center justify-center"
                          title="Certificate not yet generated by admin"
                        >
                          <Award className="w-5 h-5 mr-2" />
                          Certificate Pending
                        </button>
                      )}
                      
                      {/* Admin Actions */}
                      {me && ((typeof ev.createdBy === 'object' ? ev.createdBy._id : ev.createdBy) === me.id) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(ev)}
                            className="flex-1 bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200 flex items-center justify-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEvent(ev._id)}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Admin Invite Section */}
                    {me && ev.createdBy === me.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-2 mb-3">
                          <input 
                            className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                            placeholder="Invite emails (comma separated)" 
                            value={inviteEmails} 
                            onChange={(e)=>setInviteEmails(e.target.value)} 
                          />
                          <button 
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center" 
                            onClick={async ()=>{
                              const emails = inviteEmails.split(',').map(x=>x.trim()).filter(Boolean);
                              if (emails.length===0) return alert('Add emails');
                              const res = await fetch(`http://localhost:5000/api/invitations/${ev._id}`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ emails }) });
                              const data = await res.json();
                              if (data.msg) { alert('Invitations created'); setInviteEmails(''); } else alert(data.error||'Failed');
                            }}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Send
                          </button>
                        </div>
                        <button 
                          className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium flex items-center justify-center" 
                          onClick={()=>{
                            console.log('Organizer certificate button clicked:', { eventId: ev._id, userId: me.id });
                            if (!ev._id || !me.id) {
                              console.error('Missing eventId or userId:', { eventId: ev._id, userId: me.id });
                              alert('Error: Missing event or user information');
                              return;
                            }
                            const url = `http://localhost:5000/api/certificates/${ev._id}/${me.id}`;
                            console.log('Opening certificate URL:', url);
                            window.open(url, '_blank');
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Generate & Download My Certificate
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">This will create a certificate record and download the PDF</p>
                      </div>
                    )}
                    
                    {/* RSVP Section */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <button
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            myRsvp[ev._id]==="going" 
                              ? "bg-green-500 text-white shadow-lg" 
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                          disabled={!!rsvpSaving[ev._id]}
                          onClick={() => handleRSVP(ev._id, "going")}
                        >
                          {myRsvp[ev._id]==="going" ? "Going ✓" : (rsvpSaving[ev._id] ? "Saving..." : "Going")}
                        </button>
                        <button
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            myRsvp[ev._id]==="maybe" 
                              ? "bg-gray-500 text-white shadow-lg" 
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          disabled={!!rsvpSaving[ev._id]}
                          onClick={() => handleRSVP(ev._id, "maybe")}
                        >
                          {myRsvp[ev._id]==="maybe" ? "Maybe ✓" : (rsvpSaving[ev._id] ? "Saving..." : "Maybe")}
                        </button>
                        <button
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            myRsvp[ev._id]==="not_going" 
                              ? "bg-slate-500 text-white shadow-lg" 
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                          disabled={!!rsvpSaving[ev._id]}
                          onClick={() => handleRSVP(ev._id, "not_going")}
                        >
                          {myRsvp[ev._id]==="not_going" ? "Not going ✓" : (rsvpSaving[ev._id] ? "Saving..." : "Not going")}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">No events available yet</h3>
                <p className="text-gray-400">Check back later for new events or create your own!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-lg mb-8"
          >
            <div className="flex items-center mb-6">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((ev, index) => (
                <motion.div
                  key={ev._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{ev.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {ev.startAt ? new Date(ev.startAt).toLocaleString() : ""}
                  </p>
                  <button 
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium" 
                    onClick={() => handleRegister(ev._id)}
                  >
                    Register Now
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Edit Event Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Edit Event</h3>
                <button
                  onClick={() => setEditing(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                  <input 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    value={editForm.title} 
                    onChange={(e)=>setEditForm({...editForm, title:e.target.value})} 
                    placeholder="Enter event title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24" 
                    value={editForm.description} 
                    onChange={(e)=>setEditForm({...editForm, description:e.target.value})}
                    placeholder="Enter event description"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                    <input 
                      type="datetime-local" 
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      value={editForm.startAt} 
                      onChange={(e)=>setEditForm({...editForm, startAt:e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                    <input 
                      type="datetime-local" 
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      value={editForm.endAt} 
                      onChange={(e)=>setEditForm({...editForm, endAt:e.target.value})} 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guests (comma separated)</label>
                  <input 
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                    placeholder="Enter guest emails separated by commas" 
                    value={editForm.guests} 
                    onChange={(e)=>setEditForm({...editForm, guests:e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="flex gap-4 justify-end mt-8">
                <button 
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200" 
                  onClick={()=>setEditing(null)}
                >
                  Cancel
                </button>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium" 
                  onClick={saveEdit}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
