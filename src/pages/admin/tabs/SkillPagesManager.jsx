// src/pages/admin/tabs/SkillPagesManager.jsx
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/config";
import {
  Plus, Trash2, Edit2, Save,
  X, ChevronDown, Loader2,
  CheckCircle2, AlertTriangle,
  BookOpen, GripVertical,
} from "lucide-react";

// ── Tiny rich text toolbar (no extra libraries) ──────────────────
function SimpleEditor({ value, onChange }) {
  const insert = (before, after = "") => {
    const ta = document.getElementById("page-content-editor");
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const newVal =
      value.substring(0, start) +
      before + (selected || "text here") + after +
      value.substring(end);
    onChange(newVal);
  };

  const tools = [
    { label: "B", title: "Bold", action: () => insert("<strong>", "</strong>") },
    { label: "I", title: "Italic", action: () => insert("<em>", "</em>") },
    { label: "H3", title: "Heading", action: () => insert("<h3>", "</h3>") },
    { label: "UL", title: "Bullet list", action: () => insert("<ul>\n <li>", "</li>\n</ul>") },
    { label: "OL", title: "Numbered list",action: () => insert("<ol>\n <li>", "</li>\n</ol>") },
    { label: "💡", title: "Tip box", action: () => insert('<blockquote>', '</blockquote>') },
    { label: "Table", title: "Table", action: () => insert('<table>\n <tr><th>Header</th></tr>\n <tr><td>', '</td></tr>\n</table>') },
  ];

  return (
    <div className="flex flex-col gap-0 border border-slate-700 
      rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-slate-800/60 
        border-b border-slate-700">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            title={t.title}
            onClick={t.action}
            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 
              text-slate-200 text-xs font-bold rounded-md 
              transition-colors"
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Textarea */}
      <textarea
        id="page-content-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        placeholder="Write page content here using HTML tags, or use the toolbar above..."
        className="w-full px-4 py-3 bg-slate-950 text-sm 
          text-slate-200 placeholder:text-slate-600 
          focus:outline-none resize-none leading-relaxed font-mono"
      />
      {/* Preview toggle */}
      {value && (
        <details className="border-t border-slate-700">
          <summary className="px-4 py-2 text-xs text-slate-500 
            cursor-pointer hover:text-slate-300 bg-slate-900/40 
            select-none">
            Preview rendered HTML
          </summary>
          <div
            className="p-4 prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-p:text-slate-300
              prose-li:text-slate-300 prose-strong:text-white
              prose-blockquote:border-blue-500 
              prose-blockquote:text-slate-400
              prose-table:text-slate-300 prose-th:bg-slate-800"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        </details>
      )}
    </div>
  );
}

// ── Empty form template ───────────────────────────────────────────
const EMPTY_FORM = {
  pageNumber: "",
  title: "",
  content: "",
  summary: "",
  imageURL: "",
  keyConcepts: "",
  pageType: "content",
};

// ── Page type options ─────────────────────────────────────────────
const PAGE_TYPES = [
  "intro", "theory", "tools",
  "practical", "advanced", "summary", "content",
];

export default function SkillPagesManager() {
  const [skills, setSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [pages, setPages] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingPages, setLoadingPages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ── Load skills list ────────────────────────────────────────────
  useEffect(() => {
    async function loadSkills() {
      try {
        const snap = await getDocs(collection(db, "skills"));
        const list = snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name || d.data().title || d.id,
        }));
        setSkills(list);
        if (list.length > 0) setSelectedSkillId(list[0].id);
      } catch (e) {
        setError("Failed to load skills: " + e.message);
      } finally {
        setLoadingSkills(false);
      }
    }
    loadSkills();
  }, []);

  // ── Load pages when skill changes ───────────────────────────────
  useEffect(() => {
    if (!selectedSkillId) return;
    loadPages(selectedSkillId);
  }, [selectedSkillId]);

  const loadPages = async (skillId) => {
    setLoadingPages(true);
    setPages([]);
    setError("");
    try {
      // Correct path: /skills/{skillId}/pages
      const pagesRef = collection(db, "skills", skillId, "pages");
      const q = query(pagesRef, orderBy("pageNumber", "asc"));
      const snap = await getDocs(q);

      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setPages(list);
    } catch (e) {
      // If orderBy fails (missing index) fall back to client sort
      console.warn("orderBy failed, using fallback sort:", e.message);
      try {
        const snap = await getDocs(
          collection(db, "skills", skillId, "pages")
        );
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
        setPages(list);
      } catch (e2) {
        setError("Failed to load pages: " + e2.message);
      }
    } finally {
      setLoadingPages(false);
    }
  };

  // ── Open add form ───────────────────────────────────────────────
  const openAddForm = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      pageNumber: pages.length + 1,
    });
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Open edit form ──────────────────────────────────────────────
  const openEditForm = (page) => {
    setEditingId(page.id);
    setForm({
      pageNumber: page.pageNumber || "",
      title: page.title || "",
      content: page.content || "",
      summary: page.summary || "",
      imageURL: page.imageURL || "",
      keyConcepts: Array.isArray(page.keyConcepts)
        ? page.keyConcepts.join(", ")
        : page.keyConcepts || "",
      pageType: page.pageType || "content",
    });
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Save page ───────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedSkillId) {
      setError("Please select a skill first.");
      return;
    }
    if (!form.title.trim()) {
      setError("Page title is required.");
      return;
    }
    if (!form.content.trim()) {
      setError("Page content is required.");
      return;
    }
    if (!form.pageNumber || isNaN(Number(form.pageNumber))) {
      setError("Page number must be a valid number.");
      return;
    }

    setSaving(true);
    try {
      // Parse key concepts from comma-separated string
      const keyConcepts = form.keyConcepts
        ? form.keyConcepts
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : [];

      const pageData = {
        pageNumber: Number(form.pageNumber),
        title: form.title.trim(),
        content: form.content.trim(),
        summary: form.summary.trim(),
        imageURL: form.imageURL.trim(),
        keyConcepts,
        pageType: form.pageType,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        // ── UPDATE existing page ──────────────────────────────
        await updateDoc(
          doc(db, "skills", selectedSkillId, "pages", editingId),
          pageData
        );
        setSuccess(`Page ${form.pageNumber} updated successfully.`);
      } else {
        // ── CREATE new page ───────────────────────────────────
        // Exact correct path: /skills/{skillId}/pages/{auto-id}
        await addDoc(
          collection(db, "skills", selectedSkillId, "pages"),
          { ...pageData, createdAt: serverTimestamp() }
        );
        setSuccess(`Page ${form.pageNumber} "${form.title}" added.`);
      }

      // Reload pages list
      await loadPages(selectedSkillId);

      // Reset form
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);

    } catch (e) {
      console.error("Save error:", e);
      setError("Failed to save page: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete page ─────────────────────────────────────────────────
  const handleDelete = async (pageId, pageTitle) => {
    if (!window.confirm(
      `Delete "${pageTitle}"? This cannot be undone.`
    )) return;

    setDeleting(pageId);
    try {
      await deleteDoc(
        doc(db, "skills", selectedSkillId, "pages", pageId)
      );
      await loadPages(selectedSkillId);
      setSuccess("Page deleted.");
    } catch (e) {
      setError("Failed to delete: " + e.message);
    } finally {
      setDeleting("");
    }
  };

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Tutorial Pages Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Add and manage tutorial pages for each skill.
            Pages save to{" "}
            <code className="text-blue-400 text-xs font-mono">
              /skills/&#123;id&#125;/pages
            </code>
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openAddForm}
            disabled={!selectedSkillId}
            className="inline-flex items-center gap-2 px-4 py-2.5
              bg-blue-600 hover:bg-blue-500 text-white text-sm 
              font-semibold rounded-xl transition-colors 
              disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            Add Page
          </button>
        )}
      </div>

      {/* Skill selector */}
      <div className="bg-slate-900/30 border border-slate-800 
        rounded-xl p-4">
        <label className="text-xs font-semibold text-slate-400 
          block mb-2">
          SELECT SKILL
        </label>
        {loadingSkills ? (
          <div className="flex items-center gap-2 text-slate-500 
            text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading skills...
          </div>
        ) : (
          <select
            value={selectedSkillId}
            onChange={(e) => {
              setSelectedSkillId(e.target.value);
              setShowForm(false);
              setEditingId(null);
              setError("");
              setSuccess("");
            }}
            className="w-full px-3 py-2.5 bg-slate-950 border 
              border-slate-700 rounded-lg text-sm text-slate-200 
              focus:outline-none focus:border-blue-500 
              transition-colors"
          >
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
        {selectedSkillId && (
          <p className="text-xs text-slate-600 font-mono mt-1.5">
            Firestore path: skills/{selectedSkillId}/pages
          </p>
        )}
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 
          border border-emerald-500/30 text-emerald-400 p-4 
          rounded-xl text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 
          border border-red-500/30 text-red-400 p-4 rounded-xl 
          text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div className="bg-slate-900/40 border border-blue-500/30 
          rounded-2xl p-6 space-y-5">

          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">
              {editingId ? "Edit Page" : "Add New Page"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(EMPTY_FORM);
                setError("");
              }}
              className="text-slate-500 hover:text-white 
                transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">

            {/* Row: page number + page type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold 
                  text-slate-400">
                  PAGE NUMBER *
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.pageNumber}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f, pageNumber: e.target.value
                    }))
                  }
                  className="px-3 py-2 bg-slate-950 border 
                    border-slate-700 rounded-lg text-sm 
                    text-slate-200 focus:outline-none 
                    focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold 
                  text-slate-400">
                  PAGE TYPE
                </label>
                <select
                  value={form.pageType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f, pageType: e.target.value
                    }))
                  }
                  className="px-3 py-2 bg-slate-950 border 
                    border-slate-700 rounded-lg text-sm 
                    text-slate-200 focus:outline-none 
                    focus:border-blue-500"
                >
                  {PAGE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold 
                text-slate-400">
                PAGE TITLE *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Introduction to UI/UX Design"
                className="px-3 py-2.5 bg-slate-950 border 
                  border-slate-700 rounded-lg text-sm 
                  text-slate-200 placeholder:text-slate-600 
                  focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Content editor */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold 
                text-slate-400">
                PAGE CONTENT * (HTML)
              </label>
              <SimpleEditor
                value={form.content}
                onChange={(v) =>
                  setForm((f) => ({ ...f, content: v }))
                }
              />
            </div>

            {/* Summary */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold 
                text-slate-400">
                PAGE SUMMARY (optional — shown at bottom of page)
              </label>
              <textarea
                value={form.summary}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f, summary: e.target.value
                  }))
                }
                rows={2}
                placeholder="One sentence summary of this page..."
                className="px-3 py-2 bg-slate-950 border 
                  border-slate-700 rounded-lg text-sm 
                  text-slate-200 placeholder:text-slate-600 
                  focus:outline-none focus:border-blue-500 
                  resize-none"
              />
            </div>

            {/* Image URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold 
                text-slate-400">
                PAGE IMAGE URL (optional — Cloudinary URL)
              </label>
              <input
                type="url"
                value={form.imageURL}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f, imageURL: e.target.value
                  }))
                }
                placeholder="https://res.cloudinary.com/..."
                className="px-3 py-2.5 bg-slate-950 border 
                  border-slate-700 rounded-lg text-sm 
                  text-slate-200 placeholder:text-slate-600 
                  focus:outline-none focus:border-blue-500"
              />
              {form.imageURL && (
                <img
                  src={form.imageURL}
                  alt="preview"
                  className="mt-1 h-24 w-auto rounded-lg 
                    object-cover border border-slate-700"
                  onError={(e) => e.target.style.display = "none"}
                />
              )}
            </div>

            {/* Key concepts */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold 
                text-slate-400">
                KEY CONCEPTS (optional — comma separated)
              </label>
              <input
                type="text"
                value={form.keyConcepts}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f, keyConcepts: e.target.value
                  }))
                }
                placeholder="e.g. Wireframing, Prototyping, User Research"
                className="px-3 py-2.5 bg-slate-950 border 
                  border-slate-700 rounded-lg text-sm 
                  text-slate-200 placeholder:text-slate-600 
                  focus:outline-none focus:border-blue-500"
              />
            </div>
            
            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 
                  py-2.5 bg-blue-600 hover:bg-blue-500 text-white 
                  text-sm font-bold rounded-xl transition-colors 
                  disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Page"
                  : "Save Page"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                  setError("");
                }}
                className="px-6 py-2.5 bg-slate-800 
                  hover:bg-slate-700 text-slate-300 text-sm 
                  font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pages list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-slate-300 text-sm font-semibold">
            {loadingPages
              ? "Loading pages..."
              : `${pages.length} page${pages.length !== 1 ? "s" : ""} found`}
          </h2>
          {pages.length > 0 && !showForm && (
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-1.5 
                text-blue-400 hover:text-blue-300 text-xs 
                font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another page
            </button>
          )}
        </div>

        {loadingPages ? (
          <div className="flex items-center justify-center py-16 
            bg-slate-900/20 border border-slate-800 rounded-xl">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center 
            py-16 bg-slate-900/20 border border-dashed 
            border-slate-700 rounded-xl gap-3">
            <BookOpen className="w-10 h-10 text-slate-600" />
            <p className="text-slate-500 text-sm">
              No pages yet for this skill
            </p>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-4 py-2 
                bg-blue-600 hover:bg-blue-500 text-white text-xs 
                font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Page
            </button>
          </div>
        ) : (
          pages.map((page) => (
            <div
              key={page.id}
              className="flex items-start gap-4 bg-slate-900/30 
                border border-slate-800 hover:border-slate-700 
                rounded-xl p-4 transition-colors"
            >
              {/* Page number badge */}
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 
                border border-blue-500/30 flex items-center 
                justify-center flex-shrink-0">
                <span className="text-blue-400 text-sm font-bold">
                  {page.pageNumber}
                </span>
              </div>

              {/* Page info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white text-sm font-semibold 
                    truncate">
                    {page.title || "Untitled page"}
                  </p>
                  {page.pageType && (
                    <span className="px-2 py-0.5 bg-slate-700 
                      text-slate-400 text-xs rounded-full 
                      flex-shrink-0">
                      {page.pageType}
                    </span>
                  )}
                </div>
                {page.summary && (
                  <p className="text-slate-500 text-xs 
                    line-clamp-1">
                    {page.summary}
                  </p>
                )}
                {page.keyConcepts?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {page.keyConcepts.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-blue-600/10 
                          border border-blue-500/20 text-blue-400 
                          text-xs rounded-full"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openEditForm(page)}
                  className="p-2 text-slate-500 hover:text-blue-400 
                    hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Edit page"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(page.id, page.title)}
                  disabled={deleting === page.id}
                  className="p-2 text-slate-500 hover:text-red-400 
                    hover:bg-red-500/10 rounded-lg transition-colors 
                    disabled:opacity-40"
                  title="Delete page"
                >
                  {deleting === page.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
