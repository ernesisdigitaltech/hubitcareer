// src/pages/dashboard/tabs/MySkills.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../context/AuthContext';
import { BookOpen, Award, ArrowRight, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

export default function MySkills() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [startedSkills, setStartedSkills] = useState([]);

  useEffect(() => {
    async function fetchUserSkillsData() {
      if (!user) return;
      try {
        // 1. Fetch all unique skills the user has attempted or completed
        const attemptsQuery = query(
          collection(db, 'quizAttempts'),
          where('userId', '==', user.uid)
        );
        const attemptsSnapshot = await getDocs(attemptsQuery);
        
        // Map attempts by skill ID to figure out high scores and status parameters
        const skillsMap = {};
        attemptsSnapshot.forEach((doc) => {
          const data = doc.data();
          const sId = data.skillId;
          
          if (!skillsMap[sId] || data.score > skillsMap[sId].highestScore) {
            skillsMap[sId] = {
              skillId: sId,
              skillName: data.skillName,
              highestScore: data.score,
              grade: data.grade,
              lastAttempted: data.createdAt
            };
          }
        });

        // 2. Fallback to fetch open registration markers from the user document profile if available
        // If a student clicks "Start Learning" but hasn't taken a quiz yet, we keep tracking them here
        const userProfileRef = query(collection(db, 'users'), where('__name__', '==', user.uid));
        const profileSnapshot = await getDocs(userProfileRef);
        
        if (!profileSnapshot.empty) {
          const profileData = profileSnapshot.docs[0].data();
          const trackingIds = profileData.startedSkills || []; // Array of skill IDs started
          
          // Hydrate tracking entries that have zero quiz completions recorded yet
          for (const sId of trackingIds) {
            if (!skillsMap[sId]) {
              // Pull foundational naming criteria from skills global collection
              const skillQuery = query(collection(db, 'skills'), where('id', '==', sId));
              const skillSnap = await getDocs(skillQuery);
              let namePlaceholder = 'In-Progress Module';
              
              if (!skillSnap.empty) {
                namePlaceholder = skillSnap.docs[0].data().name;
              }

              skillsMap[sId] = {
                skillId: sId,
                skillName: namePlaceholder,
                highestScore: null,
                grade: null,
                progressPercent: 50 // Default visual filler for initialized tracks
              };
            }
          }
        }

        setStartedSkills(Object.values(skillsMap));
      } catch (error) {
        console.error("Error generating user specialized progress ledgers: ", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserSkillsData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800/60 rounded-xl space-y-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-500">Compiling progress vectors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">My Learning Tracks</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review your academic completion percentages, high scores, and active credentials portfolio.
        </p>
      </div>

      {startedSkills.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/20 border border-slate-800/60 rounded-xl border-dashed">
          <AlertCircle className="w-8 h-8 text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm font-medium">No active courses started</p>
          <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">
            You haven't initiated any professional competency tracks yet. Head over to our catalog to begin learning.
          </p>
          <button
            onClick={() => navigate('/skills')}
            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Explore Skills Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {startedSkills.map((track) => {
            const hasTakenQuiz = track.highestScore !== null;
            const isPassed = hasTakenQuiz && track.highestScore >= 70;
            
            // Derive rendering percentages based on historical completion flags
            const renderingPercent = isPassed ? 100 : (track.progressPercent || 85);

            return (
              <div 
                key={track.skillId}
                className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 backdrop-blur-sm flex flex-col justify-between hover:border-slate-700/60 transition-all group"
              >
                <div className="space-y-4">
                  {/* Card Title Line */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        {track.skillName}
                      </h3>
                    </div>

                    {hasTakenQuiz && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase font-mono border ${
                        isPassed 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {isPassed ? 'Certified' : 'Failed'}
                      </span>
                    )}
                  </div>

                  {/* Progress Indicator Track Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono text-slate-500">
                      <span>Module Syllabus Completion</span>
                      <span className="text-slate-300 font-medium">{renderingPercent}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${isPassed ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${renderingPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Operational Score Metrics sub-panel */}
                  {hasTakenQuiz && (
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-lg text-xs font-mono">
                      <div className="text-center">
                        <span className="text-slate-500 text-[10px] block uppercase">Record Score</span>
                        <span className={`text-sm font-bold ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {track.highestScore}%
                        </span>
                      </div>
                      <div className="text-center border-l border-slate-800/60">
                        <span className="text-slate-500 text-[10px] block uppercase">Alpha Grade</span>
                        <span className="text-sm font-bold text-indigo-400 uppercase">
                          {track.grade || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Command routing footers */}
                <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-end">
                  {isPassed ? (
                    <button
                      onClick={() => navigate(`/skills/${track.skillId}/quiz`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retake Board Exam
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/skills/${track.skillId}/learn`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {hasTakenQuiz ? 'Review Chapters' : 'Continue Study'} 
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}