// src/pages/admin/tabs/QuizRecords.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { Search, Filter, Calendar, Award, User, BookOpen, AlertCircle } from 'lucide-react';

export default function QuizRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pass, fail

  useEffect(() => {
    // Queries the quizAttempts collection sorted by newest first
    const q = query(collection(db, 'quizAttempts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const attemptsData = [];
      snapshot.forEach((doc) => {
        attemptsData.push({ id: doc.id, ...doc.data() });
      });
      setRecords(attemptsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching quiz records: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper to determine text and badge colors based on score thresholds
  const getScoreStyles = (score) => {
    if (score >= 70) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        text: 'text-emerald-400',
        status: 'PASSED'
      };
    } else if (score >= 10) {
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        text: 'text-amber-400',
        status: 'FAILED'
      };
    } else {
      return {
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        text: 'text-rose-400',
        status: 'FAILED'
      };
    }
  };

  // Format timestamp helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter logic
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.skillName?.toLowerCase().includes(searchTerm.toLowerCase());

    const isPass = record.score >= 70;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pass' && isPass) || 
      (statusFilter === 'fail' && !isPass);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Quiz Attempts Ledger</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor and audit student performance across all skill examinations globally.
        </p>
      </div>

      {/* Control Bar: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-xl backdrop-blur-md">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search student name, email, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-950 text-slate-200">All Attempts</option>
              <option value="pass" className="bg-slate-950 text-emerald-400">Passed (≥70%)</option>
              <option value="fail" className="bg-slate-950 text-rose-400">Failed (&lt;70%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800/60 rounded-xl space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500">Streaming evaluation ledgers...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/20 border border-slate-800/60 rounded-xl border-dashed">
          <AlertCircle className="w-8 h-8 text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm font-medium">No quiz records found</p>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Try adjusting your search query or clear the active status filter configurations.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900/20 border border-slate-800/80 rounded-xl backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-medium text-xs tracking-wider uppercase">
                <th className="py-3.5 px-4"><div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Student</div></th>
                <th className="py-3.5 px-4"><div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Skill Module</div></th>
                <th className="py-3.5 px-4 text-center"><div className="flex items-center gap-1.5 justify-center"><Award className="w-3.5 h-3.5" /> Assessment Score</div></th>
                <th className="py-3.5 px-4 text-right"><div className="flex items-center gap-1.5 justify-end"><Calendar className="w-3.5 h-3.5" /> Completed At</div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
              {filteredRecords.map((record) => {
                const styles = getScoreStyles(record.score);
                return (
                  <tr key={record.id} className="hover:bg-slate-800/20 transition-colors group">
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                        {record.userName || 'Anonymous User'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {record.userEmail || 'no-email-recorded'}
                      </div>
                    </td>

                    {/* Skill Info */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/50">
                        {record.skillName || 'Unknown Skill Component'}
                      </span>
                    </td>

                    {/* Score Matrix Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${styles.bg}`}>
                          {record.score}%
                        </span>
                        <span className={`text-[10px] uppercase font-bold tracking-widest font-mono ${styles.text}`}>
                          {styles.status}
                        </span>
                      </div>
                    </td>

                    {/* Date/Time Completed */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-400">
                      {formatDate(record.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}