import { useState, useEffect } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, serverTimestamp, query,
  orderBy, getDocs
} from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Plus, Search, Eye, EyeOff, Pencil,
  Trash2, BookOpen, X, ImageIcon,
  FileText, ArrowLeft, GripVertical
} from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'

const CATEGORIES = [
  'Design', 'Development', 'Marketing',
  'Business', 'Data', 'Writing', 'Video',
  'Photography', 'Music', 'AI Tools', 'Finance'
]

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']

const EMPTY_FORM = {
  name: '',
  category: '',
  difficulty: '',
  duration: '',
  description: '',
  outcomes: '',
  coverImage: '',
  visible: true
}

const EMPTY_PAGE = {
  title: '',
  image: '',
  content: ''
}

// ─── TipTap Toolbar ───────────────────────────────────────────────────────────
function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-300 hover:bg-slate-600 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function TipTapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TiptapImage,
      TiptapLink.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[200px] p-4 focus:outline-none text-slate-200 text-sm'
      }
    }
  })

  if (!editor) return null

  return (
    <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-800">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-slate-600 bg-slate-700/50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <span className="underline">U</span>
        </ToolbarButton>
        <div className="w-px bg-slate-600 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          H3
        </ToolbarButton>
        <div className="w-px bg-slate-600 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          • List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
          1. List
        </ToolbarButton>
        <div className="w-px bg-slate-600 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          ❝
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
          {'</>'}
        </ToolbarButton>
        <div className="w-px bg-slate-600 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          ←
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          ↔
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          →
        </ToolbarButton>
        <div className="w-px bg-slate-600 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          ↩
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          ↪
        </ToolbarButton>
      </div>
      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SkillsManager() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Skill dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [skillToDelete, setSkillToDelete] = useState(null)
  const [editingSkill, setEditingSkill] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Pages view
  const [managingSkill, setManagingSkill] = useState(null)
  const [pages, setPages] = useState([])
  const [pagesLoading, setPagesLoading] = useState(false)

  // Page dialog
  const [pageDialogOpen, setPageDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [pageForm, setPageForm] = useState(EMPTY_PAGE)
  const [pageError, setPageError] = useState('')
  const [pageSaving, setPageSaving] = useState(false)
  const [deletePageDialog, setDeletePageDialog] = useState(false)
  const [pageToDelete, setPageToDelete] = useState(null)

  // Fetch skills
  useEffect(() => {
    const q = query(collection(db, 'skills'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setSkills(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Fetch pages when managing a skill
  useEffect(() => {
    if (!managingSkill) return
    setPagesLoading(true)
    const q = query(
      collection(db, 'skills', managingSkill.id, 'pages'),
      orderBy('order', 'asc')
    )
    const unsub = onSnapshot(q, snap => {
      setPages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setPagesLoading(false)
    })
    return () => unsub()
  }, [managingSkill])

  const filtered = skills.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'All' || s.category === categoryFilter
    return matchSearch && matchCat
  })

  // ── Skill CRUD ──
  const openAdd = () => {
    setEditingSkill(null)
    setForm(EMPTY_FORM)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (skill) => {
    setEditingSkill(skill)
    setForm({
      name: skill.name || '',
      category: skill.category || '',
      difficulty: skill.difficulty || '',
      duration: skill.duration || '',
      description: skill.description || '',
      outcomes: Array.isArray(skill.outcomes) ? skill.outcomes.join('\n') : skill.outcomes || '',
      coverImage: skill.coverImage || '',
      visible: skill.visible ?? true
    })
    setError('')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Skill name is required.')
    if (!form.category) return setError('Please select a category.')
    if (!form.difficulty) return setError('Please select a difficulty.')
    if (!form.description.trim()) return setError('Description is required.')

    setSaving(true)
    setError('')

    const outcomesArray = form.outcomes.split('\n').map(o => o.trim()).filter(Boolean)
    const data = {
      name: form.name.trim(),
      category: form.category,
      difficulty: form.difficulty,
      duration: form.duration.trim(),
      description: form.description.trim(),
      outcomes: outcomesArray,
      coverImage: form.coverImage.trim(),
      visible: form.visible,
      updatedAt: serverTimestamp()
    }

    try {
      if (editingSkill) {
        await updateDoc(doc(db, 'skills', editingSkill.id), data)
      } else {
        await addDoc(collection(db, 'skills'), { ...data, createdAt: serverTimestamp() })
      }
      setDialogOpen(false)
    } catch (err) {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleVisible = async (skill) => {
    try {
      await updateDoc(doc(db, 'skills', skill.id), {
        visible: !skill.visible,
        updatedAt: serverTimestamp()
      })
    } catch (err) { console.error(err) }
  }

  const confirmDelete = (skill) => {
    setSkillToDelete(skill)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!skillToDelete) return
    try {
      await deleteDoc(doc(db, 'skills', skillToDelete.id))
    } catch (err) { console.error(err) }
    finally {
      setDeleteDialogOpen(false)
      setSkillToDelete(null)
    }
  }

  // ── Pages CRUD ──
  const openAddPage = () => {
    setEditingPage(null)
    setPageForm(EMPTY_PAGE)
    setPageError('')
    setPageDialogOpen(true)
  }

  const openEditPage = (page) => {
    setEditingPage(page)
    setPageForm({
      title: page.title || '',
      image: page.image || '',
      content: page.content || ''
    })
    setPageError('')
    setPageDialogOpen(true)
  }

  const handleSavePage = async () => {
  if (!pageForm.title.trim()) return setPageError('Page title is required.')
  if (!pageForm.content || pageForm.content === '<p></p>')
    return setPageError('Page content is required.')

  setPageSaving(true)
  setPageError('')

  const data = {
    title: pageForm.title.trim(),
    image: pageForm.image.trim(),
    content: pageForm.content,
    updatedAt: serverTimestamp()
  }

  try {
    if (editingPage) {
      await updateDoc(
        doc(db, 'skills', managingSkill.id, 'pages', editingPage.id),
        data
      )
    } else {
      await addDoc(
        collection(db, 'skills', managingSkill.id, 'pages'),
        { ...data, order: pages.length + 1, createdAt: serverTimestamp() }
      )
      // ✅ Update pageCount on parent skill
      await updateDoc(doc(db, 'skills', managingSkill.id), {
        pageCount: pages.length + 1,
        updatedAt: serverTimestamp()
      })
    }
    setPageDialogOpen(false)
  } catch (err) {
    setPageError('Failed to save page. Please try again.')
  } finally {
    setPageSaving(false)
  }
}

  const confirmDeletePage = (page) => {
    setPageToDelete(page)
    setDeletePageDialog(true)
  }

  const handleDeletePage = async () => {
  if (!pageToDelete) return
  try {
    await deleteDoc(doc(db, 'skills', managingSkill.id, 'pages', pageToDelete.id))

    // ✅ Re-sequence remaining pages
    const remaining = pages.filter(p => p.id !== pageToDelete.id)
    await Promise.all(
      remaining.map((p, i) =>
        updateDoc(doc(db, 'skills', managingSkill.id, 'pages', p.id), { order: i + 1 })
      )
    )

    // ✅ Update pageCount on parent skill
    await updateDoc(doc(db, 'skills', managingSkill.id), {
      pageCount: remaining.length,
      updatedAt: serverTimestamp()
    })
  } catch (err) {
    console.error(err)
  } finally {
    setDeletePageDialog(false)
    setPageToDelete(null)
  }
}

  const difficultyColor = (d) => {
    if (d === 'Beginner') return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (d === 'Intermediate') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    return 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  // ── PAGES VIEW ──────────────────────────────────────────────────────────────
  if (managingSkill) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setManagingSkill(null)}
            className="text-slate-400 hover:text-white gap-2 px-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Skills
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{managingSkill.name}</h2>
            <p className="text-slate-400 text-sm mt-1">
              {pages.length} page{pages.length !== 1 ? 's' : ''} — students must read all pages before the quiz unlocks
            </p>
          </div>
          <Button
            onClick={openAddPage}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Page
          </Button>
        </div>

        {/* Pages list */}
        {pagesLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pages.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FileText className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-medium">No pages yet</p>
              <p className="text-sm mt-1">Add your first tutorial page to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pages.map((page, index) => (
              <Card key={page.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="flex items-center gap-4 py-4 px-6">
                  <GripVertical className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 text-xs font-bold">{index + 1}</span>
                  </div>
                  {page.image && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                      <img src={page.image} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{page.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1"
                      dangerouslySetInnerHTML={{
                        __html: page.content?.replace(/<[^>]+>/g, ' ').slice(0, 120) + '...'
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditPage(page)}
                      className="w-8 h-8 text-slate-400 hover:text-blue-400 hover:bg-slate-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => confirmDeletePage(page)}
                      className="w-8 h-8 text-slate-400 hover:text-red-400 hover:bg-slate-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Page Dialog */}
        <Dialog open={pageDialogOpen} onOpenChange={setPageDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingPage ? 'Edit Page' : 'Add New Page'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Page Title <span className="text-red-400">*</span></Label>
                <Input
                  value={pageForm.title}
                  onChange={e => setPageForm({ ...pageForm, title: e.target.value })}
                  placeholder="e.g. Introduction to Photoshop"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300">Page Image URL</Label>
                <Input
                  value={pageForm.image}
                  onChange={e => setPageForm({ ...pageForm, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                {pageForm.image && (
                  <div className="mt-2 rounded-lg overflow-hidden h-32 bg-slate-800">
                    <img src={pageForm.image} alt="Preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300">Page Content <span className="text-red-400">*</span></Label>
                <TipTapEditor
                  content={pageForm.content}
                  onChange={v => setPageForm({ ...pageForm, content: v })}
                />
              </div>

              {pageError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{pageError}</p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setPageDialogOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Cancel
              </Button>
              <Button onClick={handleSavePage} disabled={pageSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                {pageSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : editingPage ? 'Save Changes' : 'Add Page'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Page Dialog */}
        <Dialog open={deletePageDialog} onOpenChange={setDeletePageDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Delete Page</DialogTitle>
            </DialogHeader>
            <p className="text-slate-300 text-sm">
              Are you sure you want to delete <span className="font-semibold text-white">"{pageToDelete?.title}"</span>? This cannot be undone.
            </p>
            <DialogFooter className="gap-2 mt-2">
              <Button variant="outline" onClick={() => setDeletePageDialog(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Cancel
              </Button>
              <Button onClick={handleDeletePage} className="bg-red-600 hover:bg-red-700 text-white">
                Delete Page
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ── SKILLS TABLE VIEW ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Skills Manager</h2>
          <p className="text-slate-400 text-sm mt-1">
            {skills.length} skill{skills.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Add New Skill
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search skills..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="All" className="text-white">All Categories</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <BookOpen className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-medium">No skills found</p>
              <p className="text-sm mt-1">
                {skills.length === 0 ? 'Add your first skill to get started' : 'Try a different search or filter'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Skill</th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Category</th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Difficulty</th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Duration</th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Pages</th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filtered.map(skill => (
                    <tr key={skill.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 flex items-center justify-center">
                            {skill.coverImage ? (
                              <img src={skill.coverImage} alt={skill.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{skill.name}</p>
                            <p className="text-xs text-slate-400 line-clamp-1 max-w-48">{skill.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <Badge variant="outline" className="text-blue-400 border-blue-500/30 bg-blue-500/10 text-xs">
                          {skill.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <Badge variant="outline" className={`text-xs ${difficultyColor(skill.difficulty)}`}>
                          {skill.difficulty}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-slate-300 text-sm">{skill.duration || '—'}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <button
                          onClick={() => setManagingSkill(skill)}
                          className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-blue-400 transition-colors group"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{skill.pageCount ?? 0} pages</span>
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={skill.visible
                          ? 'text-green-400 border-green-500/30 bg-green-500/10 text-xs'
                          : 'text-slate-400 border-slate-600 bg-slate-700/50 text-xs'
                        }>
                          {skill.visible ? 'Visible' : 'Hidden'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setManagingSkill(skill)}
                            className="text-slate-400 hover:text-blue-400 hover:bg-slate-700 text-xs gap-1.5 hidden sm:flex"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Pages
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => toggleVisible(skill)} className="w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-700">
                            {skill.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => openEdit(skill)} className="w-8 h-8 text-slate-400 hover:text-blue-400 hover:bg-slate-700">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => confirmDelete(skill)} className="w-8 h-8 text-slate-400 hover:text-red-400 hover:bg-slate-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Skill Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingSkill ? 'Edit Skill' : 'Add New Skill'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-slate-300">Skill Name <span className="text-red-400">*</span></Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Adobe Photoshop" className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Category <span className="text-red-400">*</span></Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300">Difficulty <span className="text-red-400">*</span></Label>
                <Select value={form.difficulty} onValueChange={v => setForm({ ...form, difficulty: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {DIFFICULTIES.map(d => (
                      <SelectItem key={d} value={d} className="text-white">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Duration</Label>
              <Input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2–3 hours" className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Description <span className="text-red-400">*</span></Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description of what users will learn..." rows={3} className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Learning Outcomes</Label>
              <p className="text-xs text-slate-500">One outcome per line</p>
              <Textarea value={form.outcomes} onChange={e => setForm({ ...form, outcomes: e.target.value })} placeholder={"Understand the basics of design\nCreate professional layouts\nExport assets for web"} rows={4} className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Cover Image URL</Label>
              <Input value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} placeholder="https://example.com/image.jpg" className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
              {form.coverImage && (
                <div className="mt-2 rounded-lg overflow-hidden h-32 bg-slate-800">
                  <img src={form.coverImage} alt="Preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div>
                <p className="text-sm font-medium text-white">Visible to students</p>
                <p className="text-xs text-slate-400">Hidden skills won't appear in the Skills Directory</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, visible: !form.visible })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.visible ? 'bg-blue-600' : 'bg-slate-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.visible ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editingSkill ? 'Save Changes' : 'Add Skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Skill Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Skill</DialogTitle>
          </DialogHeader>
          <p className="text-slate-300 text-sm">
            Are you sure you want to delete <span className="font-semibold text-white">{skillToDelete?.name}</span>? This cannot be undone.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete Skill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}