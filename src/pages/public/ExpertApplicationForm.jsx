// src/pages/public/ExpertApplicationForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, FileText, Send, User, Mail, Phone, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function ExpertApplicationForm() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeRole, setActiveRole] = useState(null);

  const [formData, setFormData] = useState({
    cvUrl: '',
    coverLetter: '',
    userPhone: ''
  });

  useEffect(() => {
    async function loadRoleDetails() {
      try {
        // Queries open positions in Firestore matching the exact document or skill matching criteria
        const q = query(collection(db, 'openRoles'), where('id', '==', roleId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setActiveRole(querySnapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error loading targeted career role profile: ", error);
      } finally {
        setLoading(false);
      }
    }
    loadRoleDetails();
  }, [roleId]);

  // Seed default phone data if present on registration user profile documents
  useEffect(() => {
    if (userData?.phone) {
      setFormData((prev) => ({ ...prev, userPhone: userData.phone }));
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Pushes candidate profile straight into the expertApplications target table collection
      await addDoc(collection(db, 'expertApplications'), {
        userId: user.uid,
        userName: user.displayName || userData?.name || 'Hubitcareer Professional',
        userEmail: user.email,
        userPhone: formData.userPhone,
        roleId: roleId,
        roleName: activeRole?.title || 'Expert Tutor Vacancy',
        category: activeRole?.category || 'General Digital Space',
        cvUrl: formData.cvUrl,
        coverLetter: formData.coverLetter,
        examScore: null, // Left null until user completes vetting exam requirement
        passMark: activeRole?.passMark || 70,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSuccess(true);
    } catch (error) {
      console.error("Error committing expert faculty submission: ", error);
      alert("Application transaction failed. Verify connection fields or cloud operational constraints.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm font-mono tracking-widest">LOADING POSITION CRITERIA...</p>
      </div>
    );
  }

  if (!activeRole) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-white">Listing Profile Terminated</h2>
        <p className="text-slate-400 text-sm max-w-md mt-2">
          The requested position has either reached processing capacity, expired, or been deactivated by the system management team.
        </p>
        <button 
          onClick={() => navigate('/careers')}
          className="mt-6 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-white font-medium cursor-pointer"
        >
          Return to Open Roles
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-slate-300">
      <div className="max-w-2xl mx-auto">
        
        {success ? (
          /* Confirmation State UI wrapper */
          <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-8 backdrop-blur-md text-center space-y-5 animate-scale-in">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white">Application File Compiled</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Your profile dossier for <span className="text-blue-400 font-semibold">{activeRole.title}</span> was submitted successfully to our operations board.
              </p>
            </div>
            <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
              <p className="text-amber-400 font-semibold uppercase font-mono tracking-wider">⚠️ Critical Next Action Requirement:</p>
              <p className="text-slate-400 leading-relaxed">
                To activate this file for review, you must complete the required <strong>Expert Vetting Exam</strong> module inside your user application tracker workspace panel.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Go to Application Tracker
              </button>
            </div>
          </div>
        ) : (
          /* Core Data Input Form */
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                <Briefcase className="w-3.5 h-3.5" /> Onboarding Faculty Portal
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Apply for: {activeRole.title}</h1>
              <p className="text-slate-400 text-sm">
                Complete your professional deployment fields. All submissions stream directly onto administrative panels for screening.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-5">
              
              {/* Context Section: Lock User Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl text-xs space-y-2 sm:space-y-0">
                <div className="space-y-1">
                  <span className="text-slate-500 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Full Name</span>
                  <p className="text-slate-300 font-semibold">{user.displayName || userData?.name || 'Account Native'}</p>
                </div>
                <div className="space-y-1 sm:border-l sm:border-slate-800/60 sm:pl-4">
                  <span className="text-slate-500 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email Destination</span>
                  <p className="text-slate-400 font-mono font-medium truncate">{user.email}</p>
                </div>
              </div>

              {/* Dynamic input blocks */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> Contact Phone Line
                </label>
                <input
                  type="tel"
                  name="userPhone"
                  required
                  placeholder="e.g. +234 800 000 0000"
                  value={formData.userPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Portfolio / CV Document Link (Cloudinary or Drive)
                </label>
                <input
                  type="url"
                  name="cvUrl"
                  required
                  placeholder="https://example.com/your-cv.pdf"
                  value={formData.cvUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600 font-mono text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Brief Executive Summary / Cover Letter</label>
                <textarea
                  name="coverLetter"
                  required
                  rows={5}
                  placeholder="Summarize your hands-on competencies and teaching methodologies matching this digital module domain..."
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-slate-600 leading-relaxed"
                />
              </div>

              {/* Submit Buttons footer area layout */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg disabled:opacity-40 transition-colors shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Registering Files...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Dossier & Proceed
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}