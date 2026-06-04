import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

export default function TutorialReader() {
  const { skillId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [skill, setSkill] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pagesRead, setPagesRead] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  // Fetch skill + existing progress
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const skillDoc = await getDoc(doc(db, "skills", skillId));
        if (!skillDoc.exists()) {
          navigate("/skills");
          return;
        }
        const skillData = { id: skillDoc.id, ...skillDoc.data() };
        setSkill(skillData);

        // Load saved progress
        const progDoc = await getDoc(
          doc(db, "users", user.uid, "progress", skillId)
        );
        if (progDoc.exists()) {
          const saved = progDoc.data();
          const savedPage = saved.lastPage || 0;
          setPagesRead(saved.pagesRead || 0);
          setCurrentPage(savedPage);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [skillId, user]);

  const saveProgress = useCallback(
    async (pageIndex, totalPagesRead) => {
      if (!user || !skill) return;
      setSaving(true);
      try {
        const totalPages = skill.pages?.length || 0;
        const completed = totalPagesRead >= totalPages;
        await setDoc(
          doc(db, "users", user.uid, "progress", skillId),
          {
            skillId,
            skillTitle: skill.title,
            lastPage: pageIndex,
            pagesRead: totalPagesRead,
            completed,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        console.error("Progress save error:", e);
      } finally {
        setSaving(false);
      }
    },
    [user, skill, skillId]
  );

  const handleNext = async () => {
    const pages = skill?.pages || [];
    const nextPage = currentPage + 1;
    const newPagesRead = Math.max(pagesRead, nextPage);

    setCurrentPage(nextPage);
    setPagesRead(newPagesRead);
    await saveProgress(nextPage, newPagesRead);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinish = async () => {
    const totalPages = skill?.pages?.length || 0;
    await saveProgress(currentPage, totalPages);
    navigate(`/skills/${skillId}/quiz`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg animate-pulse">Loading tutorial...</div>
      </div>
    );
  }

  if (!skill || !skill.pages?.length) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col gap-4">
        <div className="text-slate-400 text-lg">No tutorial content found.</div>
        <button
          onClick={() => navigate(`/skills/${skillId}`)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm"
        >
          Back to Skill
        </button>
      </div>
    );
  }

  const pages = skill.pages;
  const totalPages = pages.length;
  const page = pages[currentPage];
  const isLast = currentPage === totalPages - 1;
  const progressPct = Math.round(((currentPage + 1) / totalPages) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Back */}
          <button
            onClick={() => navigate(`/skills/${skillId}`)}
            className="text-slate-400 hover:text-white text-sm transition-colors flex-shrink-0"
          >
            ← Back
          </button>

          {/* Progress Bar */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-xs">
                Page {currentPage + 1} of {totalPages}
              </span>
              <span className="text-blue-400 text-xs font-medium">{progressPct}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Saving indicator */}
          {saving && (
            <span className="text-slate-500 text-xs flex-shrink-0">Saving...</span>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Page Title */}
        {page.title && (
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
            {page.title}
          </h1>
        )}

        {/* Page Image */}
        {page.image && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-700/50">
            <img
              src={page.image}
              alt={page.title || `Page ${currentPage + 1}`}
              className="w-full object-cover max-h-72"
            />
          </div>
        )}

        {/* Page Body — Rich HTML */}
        {page.content && (
          <div
            className="prose prose-invert prose-slate max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-p:text-slate-300 prose-p:leading-relaxed
              prose-li:text-slate-300
              prose-strong:text-white
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-code:text-blue-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700
              prose-blockquote:border-blue-500 prose-blockquote:text-slate-400
              prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <span className="text-slate-500 text-sm hidden sm:block">
            {skill.title}
          </span>

          {isLast ? (
            <button
              onClick={handleFinish}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 transition-all text-sm"
            >
              Take Quiz →
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm"
            >
              Next Page →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}