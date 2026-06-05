// src/pages/admin/tabs/SkillPagesManager.jsx

import { useState, useEffect } from "react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/config";
import {
  Plus, Trash2, Edit2, Save, X,
  Loader2, CheckCircle2, AlertTriangle,
  BookOpen, GripVertical,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

// ── Cloudinary config ─────────────────────────────────────────────
const CLOUD_NAME = "duts24f8u"; // 🔁 Replace
const UPLOAD_PRESET = "hubitcareer_preset"; // 🔁 Replace

// ── Cloudinary Upload Button ──────────────────────────────────────
function CloudinaryUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "hubitcareer/pages");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        setError("Upload failed. Check your Cloudinary preset.");
      }
    } catch {
      setError("Upload error. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-slate-300 text-sm font-medium block">
        Page Image <span className="text-slate-500 font-normal">(optional)</span>
      </label>

      {value && (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-700/50">
          <img src={value} alt="Page" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 bg-red-600/80 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center transition-all"
          >✕</button>
        </div>
      )}

      {!value && (
        <label className="w-full h-32 border-2 border-dashed border-slate-600 hover:border-blue-500/60 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-800/40 hover:bg-slate-800/60">
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              <span className="text-slate-400 text-xs">Uploading...</span>
            </>
          ) : (
            <>
              <span className="text-2xl">🖼️</span>
              <span className="text-slate-300 text-xs font-medium">Click to upload page image</span>
              <span className="text-slate-500 text-xs">PNG, JPG, WEBP — max 5MB</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      )}

      {value && (
        <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all cursor-pointer">
          Change Image
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

// ── Toolbar Button ────────────────────────────────────────────────
const ToolbarBtn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
      active
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:text-white hover:bg-slate-700"
    }`}
  >{children}</button>
);

const Divider = () => <div className="w-px h-4 bg-slate-600 mx-1 self-center" />;

// ── TipTap Rich Text Editor ───────────────────────────────────────
function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      ImageExtension.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Write page content here..." }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/60">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-slate-700 bg-slate-800">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <u>U</u>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
          🖊
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          H2
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          H3
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
          ⬅
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
          ↔
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
          ➡
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          • List
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
          1. List
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          ❝
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          {"{ }"}
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={addLink} active={editor.isActive("link")} title="Add Link">
          🔗
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">↩</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">↪</ToolbarBtn>
      </div>

      {/* Editor Body */}
      <EditorContent
        editor={editor}
        className="
          min-h-[320px] max-h-[520px] overflow-y-auto px-5 py-4
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:min-h-[300px]
          [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:text-white [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:mb-2
          [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-white [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-1
          [&_.ProseMirror_p]:text-slate-300 [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_p]:leading-relaxed
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-3
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-3
          [&_.ProseMirror_li]:text-slate-300 [&_.ProseMirror_li]:mb-1
          [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-blue-500 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-slate-400 [&_.ProseMirror_blockquote]:my-3
          [&_.ProseMirror_pre]:bg-slate-900 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:my-3
          [&_.ProseMirror_code]:text-blue-300 [&_.ProseMirror_code]:bg-slate-900 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded
          [&_.ProseMirror_a]:text-blue-400 [&_.ProseMirror_a]:underline
          [&_.ProseMirror_mark]:bg-yellow-400/30 [&_.ProseMirror_mark]:text-yellow-200 [&_.ProseMirror_mark]:px-0.5 [&_.ProseMirror_mark]:rounded
          [&_.ProseMirror_img]:rounded-xl [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:my-3
          [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_.is-editor-empty:first-child::before]:text-slate-500 [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none
        "
      />

      {/* Word count */}
      <div className="px-4 py-2 border-t border-slate-700 flex justify-between items-center">
        <span className="text-slate-600 text-xs">
          Use toolbar above to format content
        </span>
        <span className="text-slate-500 text-xs">{wordCount} words</span>
      </div>
    </div>
  );
}

// ── Empty form ────────────────────────────────────────────────────
const EMPTY_FORM = {
  pageNumber: "",
  title: "",
  content: "",
  summary: "",
  imageURL: "",
  keyConcepts: "",
  pageType: "content",
};

const PAGE_TYPES = [
  "intro", "theory", "tools",
  "practical", "advanced", "summary", "content",
];

// ── Main Component ────────────────────────────────────────────────
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

  // Load skills
  useEffect(() => {
    async function loadSkills() {
      try {
        const snap = await getDocs(collection(db, "skills"));
        const list = snap.docs.map((d) => ({
          id: d.id,
          name: d.data().title || d.data().name || d.id,
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

  // Load pages when skill changes
  useEffect(() => {
    if (!selectedSkillId) return;
    loadPages(selectedSkillId);
  }, [selectedSkillId]);

  const loadPages = async (skillId) => {
    setLoadingPages(true);
    setPages([]);
    setError("");
    try {
      const pagesRef = collection(db, "skills", skillId, "pages");
      const q = query(pagesRef, orderBy("pageNumber", "asc"));
      const snap = await getDocs(q);
      setPages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      try {
        const snap = await getDocs(collection(db, "skills", skillId, "pages"));
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

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, pageNumber: pages.length + 1 });
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedSkillId) return setError("Please select a skill first.");
    if (!form.title.trim()) return setError("Page title is required.");
    if (!form.content.trim() || form.content === "<p></p>")
      return setError("Page content is required.");
    if (!form.pageNumber || isNaN(Number(form.pageNumber)))
      return setError("Page number must be a valid number.");

    setSaving(true);
    try {
      const keyConcepts = form.keyConcepts
        ? form.keyConcepts.split(",").map((k) => k.trim()).filter(Boolean)
        : [];

      const pageData = {
        pageNumber: Number(form.pageNumber),
        title: form.title.trim(),
        content: form.content,
        summary: form.summary.trim(),
        imageURL: form.imageURL.trim(),
        keyConcepts,
        pageType: form.pageType,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "skills", selectedSkillId, "pages", editingId),
          pageData
        );
        setSuccess(`Page ${form.pageNumber} updated successfully.`);
      } else {
        await addDoc(
          collection(db, "skills", selectedSkillId, "pages"),
          { ...pageData, createdAt: serverTimestamp() }
        );
        setSuccess(`Page "${form.title}" added successfully.`);
      }

      await loadPages(selectedSkillId);
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      setError("Failed to save page: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pageId, pageTitle) => {
    if (!window.confirm(`Delete "${pageTitle}"? This cannot be undone.`)) return;
    setDeleting(pageId);
    try {
      await deleteDoc(doc(db, "skills", selectedSkillId, "pages", pageId));
      await loadPages(selectedSkillId);
      setSuccess("Page deleted.");
    } catch (e) {
      setError("Failed to delete: " + e.message);
    } finally {
      setDeleting("");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tutorial Pages Manager</h1>
          <p className="text-slate-400 text-sm mt-1">
            Build rich tutorial pages for each skill with formatted content and images.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openAddForm}
            disabled={!selectedSkillId}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            Add Page
          </button>
        )}
      </div>

      {/* Skill Selector */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
        <label className="text-xs font-semibold text-slate-400 block mb-2">
          SELECT SKILL
        </label>
        {loadingSkills ? (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading skills...
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
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
        {selectedSkillId && (
          <p className="text-xs text-slate-600 font-mono mt-1.5">
            Path: skills/{selectedSkillId}/pages
          </p>
        )}
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 space-y-5">
          {/* Form Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">
              {editingId ? "Edit Page" : "Add New Page"}
            </h2>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Page Number + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">
                Page Number <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.pageNumber}
                onChange={(e) => setForm((p) => ({ ...p, pageNumber: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium block mb-2">
                Page Type
              </label>
              <select
                value={form.pageType}
                onChange={(e) => setForm((p) => ({ ...p, pageType: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 capitalize"
              >
                {PAGE_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">
              Page Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Introduction to UI Design"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Page Image */}
          <CloudinaryUpload
            value={form.imageURL}
            onChange={(url) => setForm((p) => ({ ...p, imageURL: url }))}
          />

          {/* Rich Text Content */}
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">
              Page Content <span className="text-red-400">*</span>
            </label>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm((p) => ({ ...p, content: html }))}
            />
          </div>

          {/* Summary */}
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">
              Page Summary <span className="text-slate-500 font-normal">(optional — shown as recap)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of what this page covers..."
              value={form.summary}
              onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Key Concepts */}
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-2">
              Key Concepts <span className="text-slate-500 font-normal">(comma separated)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Wireframe, Prototype, User Flow"
              value={form.keyConcepts}
              onChange={(e) => setForm((p) => ({ ...p, keyConcepts: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> {editingId ? "Update Page" : "Save Page"}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Pages List */}
      {loadingPages ? (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading pages...
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400">No pages yet for this skill.</p>
          <button
            onClick={openAddForm}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all"
          >
            Add First Page
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">
              {pages.length} Page{pages.length !== 1 ? "s" : ""}
            </h3>
          </div>

          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex items-start gap-4"
            >
              {/* Page image thumbnail */}
              {page.imageURL && (
                <img
                  src={page.imageURL}
                  alt={page.title}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-700"
                />
              )}

              {/* Page info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-blue-400 text-xs font-bold">
                    Page {page.pageNumber}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full capitalize">
                    {page.pageType || "content"}
                  </span>
                </div>
                <div className="text-white font-semibold truncate">{page.title}</div>
                {page.summary && (
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">{page.summary}</p>
                )}
                {page.keyConcepts?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {page.keyConcepts.map((k) => (
                      <span key={k} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs rounded-full">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => openEditForm(page)}
                  className="p-2 bg-slate-700 hover:bg-blue-600/30 border border-slate-600 hover:border-blue-500/30 text-slate-300 hover:text-blue-300 rounded-xl transition-all"
                  title="Edit page"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(page.id, page.title)}
                  disabled={deleting === page.id}
                  className="p-2 bg-slate-700 hover:bg-red-600/30 border border-slate-600 hover:border-red-500/30 text-slate-300 hover:text-red-300 rounded-xl transition-all disabled:opacity-40"
                  title="Delete page"
                >
                  {deleting === page.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

