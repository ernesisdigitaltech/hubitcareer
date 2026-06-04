// src/pages/public/QuizEngine.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Timer, AlertTriangle, CheckCircle2, XCircle, ArrowRight, RotateCcw, BookOpen, Loader2 } from 'lucide-react';

export default function QuizEngine() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentSkill, setCurrentSkill] = useState(null);
  
  // State variables for game quiz play
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default allocation

  useEffect(() => {
    async function loadQuizData() {
      try {
        // 1. Fetch questions matched to this specific skill component ID
        const q = query(collection(db, 'questionBank'), where('skillId', '==', skillId));
        const querySnapshot = await getDocs(q);
        const questionsList = [];
        
        querySnapshot.forEach((doc) => {
          questionsList.push({ id: doc.id, ...doc.data() });
        });

        // Mix or randomize list array to prevent structural copy cheating
        const shuffledQuestions = questionsList.sort(() => 0.5 - Math.random());
        setQuestions(shuffledQuestions.slice(0, 10)); // Cap exam limits to top 10 items

        // 2. Fetch parent module details context for metadata mapping references
        const skillsQuery = query(collection(db, 'skills'), where('id', '==', skillId));
        const skillSnap = await getDocs(skillsQuery);
        if (!skillSnap.empty) {
          setCurrentSkill(skillSnap.docs[0].data());
        }
      } catch (error) {
        console.error("Error setting up exam structures: ", error);
      } finally {
        setLoading(false);
      }
    }
    loadQuizData();
  }, [skillId]);

  // Countdown clock active loop controller logic
  useEffect(() => {
    if (loading || quizSubmitted || questions.length === 0) return;
    
    if (timeLeft <= 0) {
      handleCalculateAndSubmitQuiz();
      return;
    }

    const clockTimer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(clockTimer);
  }, [timeLeft, loading, quizSubmitted, questions]);

  const handleSelectOption = (optionIndex) => {
    if (quizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleCalculateAndSubmitQuiz = async () => {
    if (quizSubmitted) return;
    setQuizSubmitted(true);

    let correctHits = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctOptionIndex) {
        correctHits += 1;
      }
    });

    // Calculate percentage matrix values
    const finalPercentage = Math.round((correctHits / questions.length) * 100) || 0;
    setScore(finalPercentage);

    // Formulate custom alpha tier grade descriptors matching the overview threshold specs
    let finalGrade = 'F';
    if (finalPercentage >= 90) finalGrade = 'A';
    else if (finalPercentage >= 80) finalGrade = 'B';
    else if (finalPercentage >= 70) finalGrade = 'C';
    else if (finalPercentage >= 40) finalGrade = 'D';

    try {
      // Direct transactional atomic structure updates pushed immediately onto the ledger logs
      await addDoc(collection(db, 'quizAttempts'), {
        userId: user.uid,
        userName: user.displayName || 'Hubitcareer Student',
        userEmail: user.email,
        skillId: skillId,
        skillName: currentSkill?.name || 'Digital Competency Module',
        score: finalPercentage,
        grade: finalGrade,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Critical: Failed recording validation logging attempt: ", error);
    }
  };

  const formatTimerString = (secondsCount) => {
    const mins = Math.floor(secondsCount / 60);
    const secs = secondsCount % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm font-mono tracking-widest">COMPILING EVALUATION QUESTION MAPS...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-white">Examination Structure Unpopulated</h2>
        <p className="text-slate-400 text-sm max-w-md mt-2">
          The administrator context hasn't assigned matching exam criteria vectors onto the Question Bank for this track yet.
        </p>
        <button 
          onClick={() => navigate('/skills')}
          className="mt-6 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-white font-medium cursor-pointer"
        >
          Return to Skills Hub
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isPassed = score >= 70;

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-slate-300">
      <div className="max-w-3xl mx-auto">
        
        {/* Active Header Dashboard Banner */}
        {!quizSubmitted && (
          <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl backdrop-blur-md mb-6 animate-fade-in">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-blue-400 tracking-widest font-mono uppercase">Vetting Examination</span>
              <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-none">{currentSkill?.name}</h1>
            </div>
            
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold ${
              timeLeft < 60 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' : 'bg-slate-950/60 text-amber-400 border-slate-800'
            }`}>
              <Timer className="w-4 h-4" />
              {formatTimerString(timeLeft)}
            </div>
          </div>
        )}

        {/* Quiz Engine Evaluation Core Frame */}
        {!quizSubmitted ? (
          <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
            {/* Counter bar markers */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>Progress: {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
            </div>

            {/* Slider tracking gauge fill elements */}
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>

            {/* Question Text String output */}
            <div className="py-2">
              <h2 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                {currentQuestion?.questionText}
              </h2>
            </div>

            {/* Core Iterated Multiple Choice Controls selection blocks */}
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion?.options?.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(index)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between cursor-pointer group ${
                      isSelected 
                        ? 'bg-blue-500/10 border-blue-500 text-blue-400 font-medium' 
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <span>{option}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-shrink-0 items-center justify-center ${
                      isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-700 group-hover:border-slate-500'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full"></div>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Forward/Submit Control Nav Footer blocks */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-800/60">
              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  disabled={selectedAnswers[currentQuestionIndex] == null}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold border border-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Next Item <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  disabled={Object.keys(selectedAnswers).length < totalQuestions}
                  onClick={handleCalculateAndSubmitQuiz}
                  className="inline-flex items-center gap-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-500/10 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Submit Examination Papers
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Report Card Frame layout when evaluation finishes */
          <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-8 backdrop-blur-md text-center space-y-6 animate-scale-in">
            <div className="flex flex-col items-center justify-center">
              {isPassed ? (
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mb-4 text-rose-400">
                  <XCircle className="w-10 h-10" />
                </div>
              )}

              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold">EXAMINATION DISPATCH REPORT</span>
              <h2 className="text-xl font-extrabold text-white mt-1">
                {isPassed ? 'Certification Parameters Attained!' : 'Minimum Threshold Missed'}
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mt-1.5">
                {isPassed 
                  ? 'Your submission log met the institutional pass criteria grid. You are certified to claim reward artifacts.' 
                  : 'You scored below the required 70% proficiency index line. Review your textbook readings and try again.'}
              </p>
            </div>

            {/* Performance display cards parameters */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl font-mono">
              <div className="text-center space-y-1">
                <span className="text-[11px] text-slate-500 block uppercase">Final Score</span>
                <span className={`text-2xl font-black ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {score}%
                </span>
              </div>
              <div className="text-center space-y-1 border-l border-slate-800/80">
                <span className="text-[11px] text-slate-500 block uppercase">Grade Outcome</span>
                <span className={`text-2xl font-black ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {score >= 70 ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>

            {/* Final execution control navigation maps redirection toggles */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-4 max-w-md mx-auto">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full inline-flex items-center justify-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-slate-400" /> Open Records Center
              </button>
              
              {!isPassed && (
                <button
                  onClick={() => window.location.reload()}
                  className="w-full inline-flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Re-Attempt Vetting Exam
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}