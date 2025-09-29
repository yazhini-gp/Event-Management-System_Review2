import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminCertificatePage = ({ token }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [certType, setCertType] = useState('participation');
  const [winnerPosition, setWinnerPosition] = useState('');
  const [achievementText, setAchievementText] = useState('');
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [winners, setWinners] = useState([]);
  const [achievers, setAchievers] = useState([]);

  useEffect(() => {
    if (token) fetchEvents();
  }, [token]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events', { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      setEvents([]);
    }
  };

  const fetchCertificates = async (eventId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/certificates/event/${eventId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (event) => { setSelectedEvent(event); fetchCertificates(event._id); };

  const handleSignatureUpload = async (e) => {
    e.preventDefault(); if (!signatureFile) return;
    setUploadingSignature(true);
    const formData = new FormData(); formData.append('signature', signatureFile);
    try {
      const response = await fetch('http://localhost:5000/api/signature/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (response.ok) { alert('Signature uploaded successfully!'); setSignatureFile(null); } else { alert('Failed to upload signature'); }
    } catch (error) { alert('Error uploading signature'); }
    finally { setUploadingSignature(false); }
  };

  const downloadCertificate = async (certificate) => {
    try {
      const response = await fetch(`http://localhost:5000/api/certificates/${certificate.event._id}/${certificate.user._id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) { const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `certificate-${certificate.user.name.replace(/\s+/g, '-')}.pdf`; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a); }
      else { const errorData = await response.json(); alert(`Failed to download certificate: ${errorData.error || 'Unknown error'}`); }
    } catch (error) { alert('Error downloading certificate'); }
  };

  const generateCertificate = async (userId) => {
    try {
      const params = new URLSearchParams(); if (certType) params.set('type', certType); if (certType === 'winner' && winnerPosition) params.set('position', winnerPosition); if (certType === 'achievement' && achievementText) params.set('achievement', achievementText);
      const url = `http://localhost:5000/api/certificates/${selectedEvent._id}/${userId}?${params.toString()}`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) { const blob = await response.blob(); const url_download = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url_download; a.download = `certificate-${userId}.pdf`; document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url_download); document.body.removeChild(a); alert('Certificate generated and downloaded successfully!'); fetchCertificates(selectedEvent._id); }
      else { const errorData = await response.json(); alert(`Failed to generate certificate: ${errorData.error || 'Unknown error'}`); }
    } catch (error) { alert('Error generating certificate'); }
  };

  const generateBulkCertificates = async () => {
    if (!selectedEvent || !selectedEvent.registeredUsers || selectedEvent.registeredUsers.length === 0) { alert('No registered users for this event'); return; }
    setBulkGenerating(true);
    try {
      const certificates = selectedEvent.registeredUsers.map((userItem) => {
        const userId = userItem && typeof userItem === 'object' ? userItem._id : userItem;
        let userCertType = 'participation'; let position = ''; let achievement = '';
        const userIdStr = String(userId);
        if (winners.some(winnerId => String(winnerId) === userIdStr)) { userCertType = 'winner'; position = winnerPosition || 'Winner'; }
        else if (achievers.some(achieverId => String(achieverId) === userIdStr)) { userCertType = 'achievement'; achievement = achievementText || 'Outstanding Performance'; }
        if (!userId) return null; return { userId, type: userCertType, position: position || undefined, achievement: achievement || undefined };
      }).filter(Boolean);
      if (certificates.length === 0) { alert('No valid users found for certificate generation.'); setBulkGenerating(false); return; }
      const response = await fetch(`http://localhost:5000/api/certificates/bulk/${selectedEvent._id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ certificates }) });
      if (response.ok) { const data = await response.json(); const successCount = data.successCount || 0; const errorCount = data.errorCount || 0; const totalCount = data.totalProcessed || certificates.length; alert(`Bulk generation completed!\n\nTotal processed: ${totalCount}\nSuccessfully generated: ${successCount}\nFailed: ${errorCount}`); fetchCertificates(selectedEvent._id); }
      else { const errorData = await response.json(); alert(`Failed to generate certificates: ${errorData.error || 'Unknown error'}`); }
    } catch (error) { alert('Error in bulk certificate generation'); }
    finally { setBulkGenerating(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Certificate Management</h1>
          <p className="mt-2 text-gray-600">Manage digital certificates for your events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Select Event</h2>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event._id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedEvent?._id === event._id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => handleEventSelect(event)}>
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.startAt ? new Date(event.startAt).toLocaleDateString() : 'No date set'}</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Upload Signature</h2>
            <form onSubmit={handleSignatureUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Signature Image</label>
                <input type="file" accept="image/*" onChange={(e) => setSignatureFile(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
              </div>
              <button type="submit" disabled={!signatureFile || uploadingSignature} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {uploadingSignature ? 'Uploading...' : 'Upload Signature'}
              </button>
            </form>
          </div>
        </div>

        {selectedEvent && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Bulk Certificate Generation</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Winners</label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                    {selectedEvent.registeredUsers && selectedEvent.registeredUsers.map((userItem) => {
                      const userId = userItem && typeof userItem === 'object' ? userItem._id : userItem;
                      const userName = userItem && typeof userItem === 'object' ? userItem.name : `User ${userId}`;
                      return (
                        <label key={userId} className="flex items-center">
                          <input type="checkbox" checked={winners.some(winnerId => String(winnerId) === String(userId))} onChange={(e) => { if (e.target.checked) { setWinners([...winners, userId]); } else { setWinners(winners.filter(id => String(id) !== String(userId))); } }} className="mr-2" />
                          <span className="text-sm">{userName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Achievers</label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                    {selectedEvent.registeredUsers && selectedEvent.registeredUsers.map((userItem) => {
                      const userId = userItem && typeof userItem === 'object' ? userItem._id : userItem;
                      const userName = userItem && typeof userItem === 'object' ? userItem.name : `User ${userId}`;
                      return (
                        <label key={userId} className="flex items-center">
                          <input type="checkbox" checked={achievers.some(achieverId => String(achieverId) === String(userId))} onChange={(e) => { if (e.target.checked) { setAchievers([...achievers, userId]); } else { setAchievers(achievers.filter(id => String(id) !== String(userId))); } }} className="mr-2" />
                          <span className="text-sm">{userName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Winner Position</label>
                  <input value={winnerPosition} onChange={(e)=>setWinnerPosition(e.target.value)} placeholder="1st Place, 2nd Place, Winner, etc." className="w-full border rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Text</label>
                  <input value={achievementText} onChange={(e)=>setAchievementText(e.target.value)} placeholder="Best Performance, Outstanding Contribution, etc." className="w-full border rounded-md p-2" />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={generateBulkCertificates} disabled={bulkGenerating || !selectedEvent.registeredUsers || selectedEvent.registeredUsers.length === 0} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {bulkGenerating ? 'Generating...' : `Generate All Certificates (${selectedEvent.registeredUsers?.length || 0} users)`}
                </button>
                <button onClick={() => { setWinners([]); setAchievers([]); setWinnerPosition(''); setAchievementText(''); }} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Clear Selection</button>
              </div>

              {certificates.length > 0 && (
                <div className="mt-4 p-4 bg-purple-50 rounded-md">
                  <p className="text-sm text-purple-800 mb-2">{certificates.length} certificate(s) generated. Download individually below or download all at once:</p>
                  <button onClick={async () => { try { for (const cert of certificates) { await downloadCertificate(cert); await new Promise(resolve => setTimeout(resolve, 400)); } } catch (error) { alert('Error downloading some certificates'); } }} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700">Download All Certificates ({certificates.length})</button>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedEvent && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold">Generated Certificates for "{selectedEvent.title}"</h2>
              <p className="text-gray-600">{certificates.length} certificate(s) generated</p>
            </div>
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-gray-600">Loading certificates...</p>
              </div>
            ) : certificates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No certificates generated for this event yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(certificates || []).map((certificate) => (
                      <tr key={certificate._id}>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{certificate.user.name}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{certificate.user.email}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{certificate.certificateNo}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">{certificate.certificateType || 'participation'}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{new Date(certificate.issuedAt).toLocaleDateString()}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button onClick={() => downloadCertificate(certificate)} className="text-purple-600 hover:text-purple-800 text-sm font-medium">Download PDF</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link to="/admin" className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50">← Back to Admin Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminCertificatePage;
