import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UserCertificatePage = ({ token, user }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user || !user.id) return;
    fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

  const fetchCertificates = async () => {
    try {
      console.log('Fetching certificates for user:', user.id);
      const response = await fetch(`http://localhost:5000/api/certificates/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Certificate response status:', response.status);
      const data = await response.json();
      console.log('Certificate data:', data);
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
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
        alert('Failed to download certificate');
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Error downloading certificate');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
          <p className="mt-2 text-gray-600">View and download your participation certificates</p>
        </div>

        {(certificates || []).length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't received any certificates yet. Certificates are generated when you participate in events.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {(certificates || []).map((certificate) => (
              <div key={certificate._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {certificate.event.title}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Event Date:</span>
                          <span className="ml-2">
                            {certificate.event.startAt 
                              ? new Date(certificate.event.startAt).toLocaleDateString()
                              : 'Not specified'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>
                          <span className="ml-2">
                            {certificate.event.location || 'Not specified'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Certificate No:</span>
                          <span className="ml-2 font-mono text-xs">
                            {certificate.certificateNo}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <span className="ml-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {certificate.certificateType || 'participation'}
                            </span>
                          </span>
                        </div>
                        {certificate.position && (
                          <div>
                            <span className="font-medium">Position:</span>
                            <span className="ml-2 text-yellow-600 font-semibold">
                              {certificate.position}
                            </span>
                          </div>
                        )}
                        {certificate.achievement && (
                          <div>
                            <span className="font-medium">Achievement:</span>
                            <span className="ml-2 text-green-600 font-semibold">
                              {certificate.achievement}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Issued Date:</span>
                          <span className="ml-2">
                            {new Date(certificate.issuedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 flex-shrink-0">
                      <button
                        onClick={() => downloadCertificate(certificate)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Certificate of {certificate.certificateType === 'winner' ? 'Winner' : 
                                   certificate.certificateType === 'achievement' ? 'Achievement' : 'Participation'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserCertificatePage;
