import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

export default function SkillDetail() {
  const { skillId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [skill, setSkill] = useState(null);
  const [progress, setProgress] = useState(null);
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch skill
        const skillDoc = await getDoc(doc(db, "skills", skillId));
        if (!skillDoc.exists()) {
          navigate("/skills");
          return;
        }
        setSkill({ id: skillDoc.id, ...skillDoc.data() });

        // Fetch user progress if logged in
        if (user) {
          const progDoc = await getDoc(
            doc(db, "users", user.uid, "progress", skillId)
          );
          if (progDoc.exists()) setProgress(progDoc.data());

          // Fetch latest quiz attempt
          const attemptsQ = query(
            collection(db, "quizAttempts"),
            where("userId", "==", user.uid),
            where("skillId", "==", skillId)
          );
          const attemptsSnap = await getDocs(attemptsQ);
          if (!attemptsSnap.empty) {
            const attempts = attemptsSnap.docs.map((d) => d.data());
            attempts.sort((a, b) => b.submittedAt?.seconds - a.submittedAt?.seconds);
            setQuizAttempt(attempts[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [skillId, user]);

  const difficultyColor = (level) => {
    if (level === "Beginner") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (level === "Intermediate") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const totalPages = skill?.pages?.length || 0;
  const pagesRead = progress?.pagesRead || 0;
  const progressPct = totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0;
  const completed = progress?.completed || false;

  const handleStart = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/skills/${skillId}/learn`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg animate-pulse">Loading skill...</div>
      </div>
    );
  }

  if (!skill) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {skill.coverImage ? (
          <img
            src={skill.coverImage}
            alt={skill.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-6 left-6">
          <Link
            to="/skills"
            className="text-slate-300 hover:text-white text-sm flex items-center gap-2 transition-colors"
          >
            ← Back to Skills
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 pb-20">
        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Badges Row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {skill.category && (
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-medium">
                {skill.category}
              </span>
            )}
            {skill.difficulty && (
              <span className={`px-3 py-1 border rounded-full text-xs font-medium ${difficultyColor(skill.difficulty)}`}>
                {skill.difficulty}
              </span>
            )}
            {skill.duration && (
              <span className="px-3 py-1 bg-slate-700/50 text-slate-300 border border-slate-600/30 rounded-full text-xs font-medium">
                ⏱ {skill.duration}
              </span>
            )}
            {totalPages > 0 && (
              <span className="px-3 py-1 bg-slate-700/50 text-slate-300 border border-slate-600/30 rounded-full text-xs font-medium">
                📄 {totalPages} pages
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {skill.title}
          </h1>

          {/* Description */}
          {skill.description && (
            <p className="text-slate-300 text-base leading-relaxed mb-6">
              {skill.description}
            </p>
          )}

          {/* Progress Bar (returning users) */}
          {user && pagesRead > 0 && (
            <div className="mb-6 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm font-medium">Your Progress</span>
                <span className="text-blue-400 text-sm font-bold">{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="text-slate-400 text-xs mt-2">
                {pagesRead} of {totalPages} pages read
                {completed && (
                  <span className="ml-2 text-green-400 font-medium">✓ Completed</span>
                )}
              </div>
            </div>
          )}

          {/* Quiz Result (if attempted) */}
          {quizAttempt && (
            <div className="mb-6 p-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-300 text-sm font-medium mb-1">
                    Last Quiz Attempt
                  </div>
                  <div className="text-slate-400 text-xs">
                    Score:{" "}
                    <span
                      className={`font-bold ${
                        quizAttempt.percentage >= 70
                          ? "text-green-400"
                          : quizAttempt.percentage >= 40
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {quizAttempt.percentage}%
                    </span>{" "}
                    — Grade:{" "}
                    <span className="text-white font-semibold">
                      {quizAttempt.grade}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/skills/${skillId}/quiz`)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 rounded-xl text-sm font-medium transition-all"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleStart}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-base"
            >
              {!user
                ? "Login to Start"
                : pagesRead === 0
                ? "Start Tutorial"
                : completed
                ? "Review Tutorial"
                : "Continue Tutorial"}
            </button>

            {completed && !quizAttempt && (
              <button
                onClick={() => navigate(`/skills/${skillId}/quiz`)}
                className="px-8 py-3.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-300 font-semibold rounded-xl transition-all text-base"
              >
                Take Quiz →
              </button>
            )}
          </div>

          {/* Learning Outcomes */}
          {skill.outcomes?.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <h2 className="text-lg font-bold text-white mb-4">
                What You'll Learn
              </h2>
              <ul className="space-y-2.5">
                {skill.outcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">✓</span>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}