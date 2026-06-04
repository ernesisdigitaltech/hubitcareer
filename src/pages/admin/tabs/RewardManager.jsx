// src/pages/admin/tabs/RewardManager.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { Search, Filter, CheckCircle2, XCircle, Clock, AlertCircle, User, Award, ExternalLink } from 'lucide-react';

export default function RewardManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'rewardRequests'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = [];
      snapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setRequests(requestsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reward requests: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update Status Logic (Approve / Reject)
  const handleUpdateStatus = async (requestId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this request as ${newStatus.toUpperCase()}?`)) {
      return;
    }

    setProcessingId(requestId);
    try {
      const requestRef = doc(db, 'rewardRequests', requestId);
      await updateDoc(requestRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating request status to ${newStatus}: `, error);
      alert("Failed to update status. Please inspect your database permissions.");
    } finally {
      setProcessingId(null);
    }
  };

  // Helper styling mappings for states
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

  // Timestamp formater tool
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter application pipeline
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.skillName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      request.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reward Requests Manager</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review, approve, or reject student requests for completed module rewards and token disbursements.
        </p>
      </div>

      {/* Filter and Command Layout */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-xl backdrop-blur-md">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search request records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Status state:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-950 text-slate-200">All States</option>
              <option value="pending" className="bg-slate-950 text-amber-400">Pending</option>
              <option value="approved" className="bg-slate-950 text-emerald-400">Approved</option>
              <option value="rejected" className="bg-slate-950 text-rose-400">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Stream Interface */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800/60 rounded-xl space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500">Awaiting reward document sync streams...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/20 border border-slate-800/60 rounded-xl border-dashed">
          <AlertCircle className="w-8 h-8 text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm font-medium">No matching reward entries</p>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            There are either no incoming applications matching your filter configurations, or users have not triggered any payouts yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredRequests.map((request) => (
            <div 
              key={request.id} 
              className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between hover:border-slate-700/60 transition-all group"
            >
              {/* Top Meta Details */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 tracking-wider block uppercase">
                      ID: {request.id.slice(0, 8)}...
                    </span>
                    <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                      {request.skillName || 'Unknown Module'}
                    </h3>
                  </div>

                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(request.status)}`}>
                    {request.status || 'pending'}
                  </span>
                </div>

                {/* Info Container Box */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950/40 border border-slate-800/60 p-3 rounded-lg text-xs">
                  <div className="space-y-1.5">
                    <span className="text-slate-500 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Student</span>
                    <p className="text-slate-300 font-medium truncate">{request.userName}</p>
                    <p className="text-slate-500 font-mono text-[10px] truncate">{request.userEmail}</p>
                  </div>
                  <div className="space-y-1.5 border-l border-slate-800/60 pl-3">
                    <span className="text-slate-500 flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Assessment details</span>
                    <p className="text-slate-300 font-medium">Score: <span className="text-blue-400 font-bold">{request.score}%</span></p>
                    <p className="text-slate-400 font-medium">Grade: <span className="text-indigo-400 uppercase">{request.grade || 'N/A'}</span></p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer layout */}
              <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">
                  Requested: {formatDate(request.createdAt)}
                </span>

                {request.status?.toLowerCase() === 'pending' || !request.status ? (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={processingId === request.id}
                      onClick={() => handleUpdateStatus(request.id, 'rejected')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 disabled:opacity-40 transition-colors font-medium cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      disabled={processingId === request.id}
                      onClick={() => handleUpdateStatus(request.id, 'approved')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-colors font-medium cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve Payout
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 italic flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Processed
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