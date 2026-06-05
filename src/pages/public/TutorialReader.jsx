import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

export default function TutorialReader() {
  const { skillId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [skill, setSkill] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pagesRead, setPagesRead] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Fetch skill document + pages subcollection + saved progress
  useEffect(() => {
    if (!user || !skillId) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        // ── 1. Fetch skill document ──────────────────
        const skillRef = doc(db, "skills", skillId);
        const skillSnap = await getDoc(skillRef);

        if (!skillSnap.exists()) {
          navigate("/skills");
          return;
        }

        const skillData = { id: skillSnap.id, ...skillSnap.data() };
        setSkill(skillData);

        // ── 2. Fetch pages from subcollection ────────
        // Pages live at /skills/{skillId}/pages/{pageId}
        // ordered by pageNumber ascending
        const pagesRef = collection(db, "skills", skillId, "pages");
        const pagesQuery = query(pagesRef, orderBy("pageNumber", "asc"));
        const pagesSnap = await getDocs(pagesQuery);

        if (pagesSnap.empty) {
          setError("No tutorial pages have been added to this skill yet.");
          setLoading(false);
          return;
        }

        const fetchedPages = pagesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setPages(fetchedPages);

        // ── 3. Load saved progress ───────────────────
        const progRef = doc(db, "users", user.uid, "progress", skillId);
        const progSnap = await getDoc(progRef);

        if (progSnap.exists()) {
          const saved = progSnap.data();
          setPagesRead(saved.pagesRead || 0);
          // Clamp saved page to valid range in case pages changed
          const savedPage = Math.min(
            saved.lastPage || 0,
            fetchedPages.length - 1
          );
          setCurrentPage(savedPage);
        }
      } catch (e) {
        console.error("TutorialReader fetch error:", e);
        setError("Failed to load tutorial. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [skillId, user, navigate]);

  // Save progress to Firestore
  const saveProgress = useCallback(
    async (pageIndex, totalPagesRead) => {
      if (!user || !skill) return;
      setSaving(true);
      try {
        const totalPages = pages.length;
        const completed = totalPagesRead >= totalPages;

        await setDoc(
          doc(db, "users", user.uid, "progress", skillId),
          {
            skillId,
            skillTitle: skill.title || skill.name || "",
            lastPage: pageIndex,
            pagesRead: totalPagesRead,
            totalPages,
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
    [user, skill, skillId, pages]
  );

  const handleNext = async () => {
    const nextPage = currentPage + 1;
    const newPagesRead = Math.max(pagesRead, nextPage);
    setCurrentPage(nextPage);
    setPagesRead(newPagesRead);
    await saveProgress(nextPage, newPagesRead);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinish = async () => {
    await saveProgress(currentPage, pages.length);
    navigate(`/skills/${skillId}/quiz`);
  };

  // ── LOADING STATE ──────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center 
        justify-center flex-col gap-4">
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid #1E2A45",
            borderTopColor: "#2979FF",
            animation: "spin .7s linear infinite",
          }}
        />
        <p className="text-slate-400 text-sm animate-pulse">
          Loading tutorial...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  // ── ERROR STATE ────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center 
        justify-center flex-col gap-4 px-4 text-center">
        <div className="text-5xl">📭</div>
        <h3 className="text-white text-lg font-semibold">{error}</h3>
        <button
          onClick={() => navigate(`/skills/${skillId}`)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 
            text-white rounded-xl text-sm font-medium transition-colors"
        >
          ← Back to Skill
        </button>
      </div>
    );
  }

  // ── NO PAGES STATE ─────────────────────────────────
  if (!pages.length) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center 
        justify-center flex-col gap-4 px-4 text-center">
        <div className="text-5xl">📝</div>
        <h3 className="text-white text-lg font-semibold">
          No tutorial pages yet
        </h3>
        <p className="text-slate-400 text-sm">
          This skill is still being prepared. Check back soon.
        </p>
        <button
          onClick={() => navigate(`/skills/${skillId}`)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 
            text-white rounded-xl text-sm font-medium transition-colors"
        >
          ← Back to Skill
        </button>
      </div>
    );
  }

  // ── TUTORIAL RENDER ────────────────────────────────
  const totalPages = pages.length;
  const page = pages[currentPage];
  const isLast = currentPage === totalPages - 1;
  const progressPct = Math.round(((currentPage + 1) / totalPages) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur 
        border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">

          <button
            onClick={() => navigate(`/skills/${skillId}`)}
            className="text-slate-400 hover:text-white text-sm 
              transition-colors flex-shrink-0"
          >
            ← Back
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-xs">
                Page {currentPage + 1} of {totalPages}
              </span>
              <span className="text-blue-400 text-xs font-medium">
                {progressPct}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 
                  h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {saving && (
            <span className="text-slate-500 text-xs flex-shrink-0">
              Saving...
            </span>
          )}
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Page title */}
        {page.title && (
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
            {page.title}
          </h1>
        )}

        {/* Page image — supports both imageURL and image field names */}
        {(page.imageURL || page.image) && (
          <div className="mb-6 rounded-2xl overflow-hidden 
            border border-slate-700/50">
            <img
              src={page.imageURL || page.image}
              alt={page.title || `Page ${currentPage + 1}`}
              className="w-full object-cover max-h-72"
            />
          </div>
        )}

        {/* Key concepts row */}
        {page.keyConcepts?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {page.keyConcepts.map((concept, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 
                  text-blue-300 rounded-full text-xs font-medium"
              >
                {concept}
              </span>
            ))}
          </div>
        )}

        {/* Rich HTML content */}
        {page.content && (
          <div
            className="prose prose-invert prose-slate max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-p:text-slate-300 prose-p:leading-relaxed
              prose-li:text-slate-300
              prose-strong:text-white
              prose-a:text-blue-400 prose-a:no-underline 
              hover:prose-a:underline
              prose-code:text-blue-300 prose-code:bg-slate-800 
              prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700
              prose-blockquote:border-blue-500 
              prose-blockquote:text-slate-400
              prose-table:text-slate-300
              prose-th:text-white prose-th:bg-slate-800
              prose-td:border-slate-700
              prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}

        {/* Page summary callout */}
        {page.summary && (
          <div className="mt-8 p-4 bg-blue-600/10 border border-blue-500/20 
            rounded-xl">
            <p className="text-blue-300 text-sm font-medium mb-1">
              Page Summary
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              {page.summary}
            </p>
          </div>
        )}

        {/* ── NAVIGATION ── */}
        <div className="flex items-center justify-between mt-12 pt-6 
          border-t border-slate-800">

          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 
              border border-slate-700 text-slate-300 hover:text-white 
              rounded-xl text-sm font-medium transition-all 
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <span className="text-slate-500 text-sm hidden sm:block">
            {skill?.title || skill?.name}
          </span>

          {isLast ? (
            <button
              onClick={handleFinish}
              className="px-6 py-3 bg-gradient-to-r from-green-600 
                to-green-500 hover:from-green-500 hover:to-green-400 
                text-white font-semibold rounded-xl shadow-lg 
                shadow-green-500/20 transition-all text-sm"
            >
              Take Quiz →
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 
                to-blue-500 hover:from-blue-500 hover:to-blue-400 
                text-white font-semibold rounded-xl shadow-lg 
                shadow-blue-500/20 transition-all text-sm"
            >
              Next Page →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
