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
  const [winners, setWinners] = useState([]); // Array of user IDs who are winners
  const [achievers, setAchievers] = useState([]); // Array of user IDs who have achievements

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  const fetchCertificates = async (eventId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/certificates/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    fetchCertificates(event._id);
  };

  const handleSignatureUpload = async (e) => {
    e.preventDefault();
    if (!signatureFile) return;

    setUploadingSignature(true);
    const formData = new FormData();
    formData.append('signature', signatureFile);

    try {
      const response = await fetch('http://localhost:5000/api/signature/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        alert('Signature uploaded successfully!');
        setSignatureFile(null);
      } else {
        alert('Failed to upload signature');
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      alert('Error uploading signature');
    } finally {
      setUploadingSignature(false);
    }
  };

  const downloadCertificate = async (certificate) => {
    try {
      const response = await fetch(`http://localhost:5000/api/certificates/${certificate.event._id}/${certificate.user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificate.user.name.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        console.error('Download failed:', errorData);
        alert(`Failed to download certificate: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Error downloading certificate');
    }
  };

  const generateCertificate = async (userId) => {
    try {
      const params = new URLSearchParams();
      if (certType) params.set('type', certType);
      if (certType === 'winner' && winnerPosition) params.set('position', winnerPosition);
      if (certType === 'achievement' && achievementText) params.set('achievement', achievementText);

      const response = await fetch(`http://localhost:5000/api/certificates/${selectedEvent._id}/${userId}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Certificate generated successfully!');
        fetchCertificates(selectedEvent._id);
      } else {
        const errorData = await response.json();
        alert(`Failed to generate certificate: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Error generating certificate');
    }
  };

  const generateBulkCertificates = async () => {
    if (!selectedEvent || !selectedEvent.registeredUsers || selectedEvent.registeredUsers.length === 0) {
      alert('No registered users for this event');
      return;
    }

    setBulkGenerating(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const userItem of selectedEvent.registeredUsers) {
        const userId = userItem && typeof userItem === 'object' ? userItem._id : userItem;
        
        // Determine certificate type for this user
        let userCertType = 'participation';
        let position = '';
        let achievement = '';

        if (winners.includes(userId)) {
          userCertType = 'winner';
          position = winnerPosition || 'Winner';
        } else if (achievers.includes(userId)) {
          userCertType = 'achievement';
          achievement = achievementText || 'Outstanding Performance';
        }

        const params = new URLSearchParams();
        params.set('type', userCertType);
        if (position) params.set('position', position);
        if (achievement) params.set('achievement', achievement);

        try {
          const response = await fetch(`http://localhost:5000/api/certificates/${selectedEvent._id}/${userId}?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to generate certificate for user ${userId}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error generating certificate for user ${userId}:`, error);
        }
      }

      alert(`Bulk generation completed! ${successCount} certificates generated successfully, ${errorCount} failed.`);
      fetchCertificates(selectedEvent._id);
    } catch (error) {
      console.error('Error in bulk generation:', error);
      alert('Error in bulk certificate generation');
    } finally {
      setBulkGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Certificate Management</h1>
          <p className="mt-2 text-gray-600">Manage digital certificates for your events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Select Event</h2>
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedEvent?._id === event._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleEventSelect(event)}
                >
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {event.startAt ? new Date(event.startAt).toLocaleDateString() : 'No date set'}
                  </p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Signature</h2>
            <form onSubmit={handleSignatureUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSignatureFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <button
                type="submit"
                disabled={!signatureFile || uploadingSignature}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingSignature ? 'Uploading...' : 'Upload Signature'}
              </button>
            </form>
          </div>
        </div>

          {/* Bulk Certificate Generation */}
          {selectedEvent && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
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
                            <input
                              type="checkbox"
                              checked={winners.includes(userId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setWinners([...winners, userId]);
                                } else {
                                  setWinners(winners.filter(id => id !== userId));
                                }
                              }}
                              className="mr-2"
                            />
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
                            <input
                              type="checkbox"
                              checked={achievers.includes(userId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAchievers([...achievers, userId]);
                                } else {
                                  setAchievers(achievers.filter(id => id !== userId));
                                }
                              }}
                              className="mr-2"
                            />
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
                    <input 
                      value={winnerPosition} 
                      onChange={(e)=>setWinnerPosition(e.target.value)} 
                      placeholder="1st Place, 2nd Place, Winner, etc." 
                      className="w-full border rounded-md p-2" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Text</label>
                    <input 
                      value={achievementText} 
                      onChange={(e)=>setAchievementText(e.target.value)} 
                      placeholder="Best Performance, Outstanding Contribution, etc." 
                      className="w-full border rounded-md p-2" 
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={generateBulkCertificates}
                    disabled={bulkGenerating || !selectedEvent.registeredUsers || selectedEvent.registeredUsers.length === 0}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkGenerating ? 'Generating...' : `Generate All Certificates (${selectedEvent.registeredUsers?.length || 0} users)`}
                  </button>
                  <button
                    onClick={() => {
                      setWinners([]);
                      setAchievers([]);
                      setWinnerPosition('');
                      setAchievementText('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Clear Selection
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>How it works:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Select users as <strong>Winners</strong> → they get Winner certificates with the position you specify</li>
                    <li>Select users as <strong>Achievers</strong> → they get Achievement certificates with the achievement text</li>
                    <li>All other registered users → get standard Participation certificates</li>
                    <li>Click "Generate All Certificates" to create certificates for everyone at once</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Individual Certificate Generation (Optional) */}
        {selectedEvent && (
          <div className="mt-8 bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                Individual Certificate Generation (Optional)
              </h2>
              <p className="text-gray-600">
                Generate certificates for specific users individually
              </p>
            </div>
            
            {selectedEvent.registeredUsers && selectedEvent.registeredUsers.length > 0 ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedEvent.registeredUsers.map((userItem) => {
                    const userId = userItem && typeof userItem === 'object' ? userItem._id : userItem;
                    const displayName = userItem && typeof userItem === 'object'
                      ? `${userItem.name || 'User'}${userItem.email ? ` (${userItem.email})` : ''}`
                      : `User ID: ${userId}`;
                    return (
                    <div key={userId} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{displayName}</p>
                          <p className="text-sm text-gray-500">Individual generation</p>
                        </div>
                        <button
                          onClick={() => generateCertificate(userId)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>No registered users for this event yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Certificates List */}
        {selectedEvent && (
          <div className="mt-8 bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                Generated Certificates for "{selectedEvent.title}"
              </h2>
              <p className="text-gray-600">
                {certificates.length} certificate(s) generated
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading certificates...</p>
              </div>
            ) : certificates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No certificates generated for this event yet.</p>
                <p className="text-sm mt-2">
                  Certificates are generated when users download them.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Certificate No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issued Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(certificates || []).map((certificate) => (
                      <tr key={certificate._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {certificate.user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {certificate.user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {certificate.certificateNo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            {certificate.certificateType || 'participation'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(certificate.issuedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => downloadCertificate(certificate)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Back to Admin Dashboard */}
        <div className="mt-8">
          <Link
            to="/admin"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminCertificatePage;
