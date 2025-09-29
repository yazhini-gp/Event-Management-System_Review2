import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Award, Calendar as CalIcon, MapPin, CheckCircle2, FileText, Trophy } from "lucide-react";
import { motion } from "framer-motion";

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
      const response = await fetch(`http://localhost:5000/api/certificates/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
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
        a.download = `certificate-${(certificate.user.name || 'user').replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download certificate');
      }
    } catch (error) {
      alert('Error downloading certificate');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading your certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
          <p className="mt-2 text-gray-600">View and download your participation certificates</p>
        </div>

        {(certificates || []).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
            <p className="text-gray-600 mb-6">
              Certificates are generated when you participate in events. Attend events to see them here.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {(certificates || []).map((certificate, index) => (
              <motion.div
                key={certificate._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Award className="w-5 h-5 text-purple-600 mr-2" />
                        <h3 className="text-xl font-semibold text-gray-900">{certificate.event.title}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalIcon className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium mr-2">Event Date:</span>
                          <span>
                            {certificate.event.startAt 
                              ? new Date(certificate.event.startAt).toLocaleDateString()
                              : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium mr-2">Location:</span>
                          <span>{certificate.event.location || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center">
                          <Trophy className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium mr-2">Type:</span>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            {certificate.certificateType || 'participation'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium mr-2">Issued:</span>
                          <span>{new Date(certificate.issuedAt).toLocaleDateString()}</span>
                        </div>
                        {certificate.position && (
                          <div className="flex items-center">
                            <Trophy className="w-4 h-4 mr-2 text-yellow-600" />
                            <span className="font-medium mr-2">Position:</span>
                            <span className="text-yellow-600 font-semibold">{certificate.position}</span>
                          </div>
                        )}
                        {certificate.achievement && (
                          <div className="flex items-center">
                            <Trophy className="w-4 h-4 mr-2 text-green-600" />
                            <span className="font-medium mr-2">Achievement:</span>
                            <span className="text-green-600 font-semibold">{certificate.achievement}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-6 flex-shrink-0">
                      <button
                        onClick={() => downloadCertificate(certificate)}
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    Certificate of {certificate.certificateType === 'winner' ? 'Winner' : 
                                   certificate.certificateType === 'achievement' ? 'Achievement' : 'Participation'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserCertificatePage;
