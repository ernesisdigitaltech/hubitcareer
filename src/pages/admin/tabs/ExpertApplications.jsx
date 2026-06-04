// src/pages/admin/tabs/ExpertApplications.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { Search, Filter, Briefcase, FileText, CheckCircle2, XCircle, Clock, AlertCircle, Mail, Phone, Loader2 } from 'lucide-react';

export default function ExpertApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'expertApplications'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const applicationsData = [];
      snapshot.forEach((doc) => {
        applicationsData.push({ id: doc.id, ...doc.data() });
      });
      setApplications(applicationsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching expert applications: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (applicationId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this expert application as ${newStatus.toUpperCase()}?`)) {
      return;
    }

    setProcessingId(applicationId);
    try {
      const applicationRef = doc(db, 'expertApplications', applicationId);
      await updateDoc(applicationRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating application status to ${newStatus}: `, error);
      alert("Failed to modify candidate file data.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
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

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.roleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      (app.status || 'pending').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Expert Applications Manager</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review credentials, vetting exams, and curriculum submissions from onboarding professional educators.
        </p>
      </div>

      {/* Workspace Control Panel */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-xl backdrop-blur-md">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search candidate profiles or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Workflow Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-950 text-slate-200">All Candidacies</option>
              <option value="pending" className="bg-slate-950 text-amber-400">Pending</option>
              <option value="approved" className="bg-slate-950 text-emerald-400">Approved Faculty</option>
              <option value="rejected" className="bg-slate-950 text-rose-400">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Board Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800/60 rounded-xl space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-slate-500">Retrieving application payloads...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/20 border border-slate-800/60 rounded-xl border-dashed">
          <AlertCircle className="w-8 h-8 text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm font-medium">No onboarding records found</p>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            No expert submissions match the selected string search parameters or active workflow stages.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredApplications.map((app) => (
            <div 
              key={app.id}
              className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between hover:border-slate-700/60 transition-all group"
            >
              <div className="space-y-4">
                {/* Header Metadata block */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      {app.roleName || 'Expert Tutor Candidate'}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-950 text-slate-400 border border-slate-800">
                      {app.category || 'General Skill Space'}
                    </span>
                  </div>

                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)}`}>
                    {app.status || 'pending'}
                  </span>
                </div>

                {/* Candidate details grids */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/40 border border-slate-800/60 p-3 rounded-lg text-xs">
                  <div className="space-y-1.5">
                    <span className="text-slate-500 font-medium">Applicant Details</span>
                    <p className="text-slate-200 font-semibold truncate">{app.userName}</p>
                    <p className="text-slate-400 flex items-center gap-1 truncate"><Mail className="w-3 h-3 text-slate-500" /> {app.userEmail}</p>
                    {app.userPhone && (
                      <p className="text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {app.userPhone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-800/60 pt-2 sm:pt-0 sm:pl-3 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-500 font-medium">Exam Vetting Status</span>
                      <p className="text-slate-300 font-medium mt-0.5">
                        Exam Score: <span className={app.examScore >= (app.passMark || 70) ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {app.examScore != null ? `${app.examScore}%` : 'Not Taken'}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">Required Threshold: {app.passMark || 70}%</p>
                    </div>

                    {app.cvUrl && (
                      <a 
                        href={app.cvUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> View CV Portfolio →
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Functional Actions Segment */}
              <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">
                  Applied: {formatDate(app.createdAt)}
                </span>

                {(app.status?.toLowerCase() === 'pending' || !app.status) ? (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={processingId === app.id}
                      onClick={() => handleUpdateStatus(app.id, 'rejected')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 disabled:opacity-40 transition-colors font-medium cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      disabled={processingId === app.id}
                      onClick={() => handleUpdateStatus(app.id, 'approved')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors font-medium cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve Faculty
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 italic flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Processing Resolved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}