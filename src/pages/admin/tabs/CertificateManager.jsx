// src/pages/admin/tabs/CertificateManager.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { Search, Filter, ShieldCheck, ShieldAlert, Award, User, Calendar, FileSpreadsheet, Loader2 } from 'lucide-react';

export default function CertificateManager() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, issued, revoked
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'certifications'), orderBy('issuedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const certsData = [];
      snapshot.forEach((doc) => {
        certsData.push({ id: doc.id, ...doc.data() });
      });
      setCertificates(certsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching certificates: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleStatus = async (certId, currentStatus) => {
    const nextStatus = currentStatus === 'revoked' ? 'issued' : 'revoked';
    if (!window.confirm(`Are you sure you want to change the certificate status to ${nextStatus.toUpperCase()}?`)) {
      return;
    }

    setProcessingId(certId);
    try {
      const certRef = doc(db, 'certifications', certId);
      await updateDoc(certRef, {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error toggling certificate status: ", error);
      alert("Failed to modify certificate operational state.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.skillName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      (cert.status || 'issued').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Academic Certificate Ledger</h1>
        <p className="text-slate-400 text-sm mt-1">
          Audit and manage cryptographically unique completion certificates issued to platform graduates.
        </p>
      </div>

      {/* Control Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-xl backdrop-blur-md">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search certificate records, IDs, or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Operational State:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-950 text-slate-200">All Credentials</option>
              <option value="issued" className="bg-slate-950 text-emerald-400">Issued / Valid</option>
              <option value="revoked" className="bg-slate-950 text-rose-400">Revoked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Workspace Viewport */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800/60 rounded-xl space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-500">Streaming credential registries...</p>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/20 border border-slate-800/60 rounded-xl border-dashed">
          <FileSpreadsheet className="w-8 h-8 text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm font-medium">No certificate credentials registered</p>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            No graduation certificates match the selected keyword filters or sorting classifications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCertificates.map((cert) => {
            const isRevoked = cert.status === 'revoked';
            return (
              <div 
                key={cert.id}
                className={`bg-slate-900/30 border rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between transition-all group ${
                  isRevoked ? 'border-rose-950/40 hover:border-rose-900/40' : 'border-slate-800/80 hover:border-slate-700/60'
                }`}
              >
                <div className="space-y-4">
                  {/* Title Bar layout */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Award className={`w-4 h-4 ${isRevoked ? 'text-slate-500' : 'text-amber-400'}`} />
                        <h3 className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-none">
                          {cert.skillName || 'Digital Skill Block'}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 tracking-wider block">
                        HASH: {cert.certificateId || cert.id}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-mono uppercase border ${
                      isRevoked 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {isRevoked ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                      {cert.status || 'issued'}
                    </span>
                  </div>

                  {/* Metadata fields info box */}
                  <div className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Recipient:</span>
                      <span className="text-slate-300 font-medium max-w-[180px] truncate">{cert.userName}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800/40 pt-2">
                      <span className="text-slate-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Issuance Date:</span>
                      <span className="text-slate-400 font-mono">{formatDate(cert.issuedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Operations segment footer */}
                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-end">
                  <button
                    disabled={processingId === cert.id}
                    onClick={() => handleToggleStatus(cert.id, cert.status || 'issued')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 cursor-pointer ${
                      isRevoked
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
                        : 'bg-rose-500/5 text-rose-400 border-rose-500/20 hover:bg-rose-500/10'
                    }`}
                  >
                    {processingId === cert.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isRevoked ? (
                      'Re-Authorize Credential'
                    ) : (
                      'Revoke Credential'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}