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
  Plus, Search, Pencil, Trash2,
  HelpCircle, ArrowLeft, X, CheckCircle2,
  BookOpen, ChevronDown
} from 'lucide-react'

// ─── Main Component ───────────────────────────────────────────────────────────
export default function QuestionBank() {
  const [skills, setSkills] = useState([])
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState(null)

  const [questions, setQuestions] = useState([])
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const EMPTY_FORM = {
    question: '',
    options: ['', '', '', ''],
    correctIndex: null,
    explanation: ''
  }
  const [form, setForm] = useState(EMPTY_FORM)

  // ── Fetch all skills (for selector) ──
  useEffect(() => {
    const q = query(collection(db, 'skills'), orderBy('name', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setSkills(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setSkillsLoading(false)
    })
    return () => unsub()
  }, [])

  // ── Fetch questions for selected skill ──
  useEffect(() => {
    if (!selectedSkill) return
    setQuestionsLoading(true)
    const q = query(
      collection(db, 'skills', selectedSkill.id, 'questions'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, snap => {
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setQuestionsLoading(false)
    })
    return () => unsub()
  }, [selectedSkill])

  const filtered = questions.filter(q =>
    q.question?.toLowerCase().includes(search.toLowerCase())
  )

  // ── Open add / edit ──
  const openAdd = () => {
    setEditingQuestion(null)
    setForm(EMPTY_FORM)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (q) => {
    setEditingQuestion(q)
    setForm({
      question: q.question || '',
      options: q.options?.length === 4 ? [...q.options] : ['', '', '', ''],
      correctIndex: q.correctIndex ?? null,
      explanation: q.explanation || ''
    })
    setError('')
    setDialogOpen(true)
  }

  // ── Validate + Save ──
  const handleSave = async () => {
    if (!form.question.trim()) return setError('Question text is required.')
    const filledOptions = form.options.map(o => o.trim())
    if (filledOptions.some(o => !o)) return setError('All 4 answer options are required.')
    if (form.correctIndex === null) return setError('Please select the correct answer.')

    setSaving(true)
    setError('')

    const data = {
      question: form.question.trim(),
      options: filledOptions,
      correctIndex: form.correctIndex,
      explanation: form.explanation.trim(),
      updatedAt: serverTimestamp()
    }

    try {
      if (editingQuestion) {
        await updateDoc(
          doc(db, 'skills', selectedSkill.id, 'questions', editingQuestion.id),
          data
        )
      } else {
        await addDoc(
          collection(db, 'skills', selectedSkill.id, 'questions'),
          { ...data, createdAt: serverTimestamp() }
        )
        // Update questionCount on skill doc
        await updateDoc(doc(db, 'skills', selectedSkill.id), {
          questionCount: questions.length + 1,
          updatedAt: serverTimestamp()
        })
      }
      setDialogOpen(false)
    } catch (err) {
      setError('Failed to save question. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ──
  const confirmDelete = (q) => {
    setQuestionToDelete(q)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!questionToDelete) return
    try {
      await deleteDoc(
        doc(db, 'skills', selectedSkill.id, 'questions', questionToDelete.id)
      )
      // Update questionCount on skill doc
      const newCount = Math.max(0, questions.length - 1)
      await updateDoc(doc(db, 'skills', selectedSkill.id), {
        questionCount: newCount,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.error(err)
    } finally {
      setDeleteDialogOpen(false)
      setQuestionToDelete(null)
    }
  }

  const updateOption = (index, value) => {
    const updated = [...form.options]
    updated[index] = value
    setForm({ ...form, options: updated })
  }

  const optionLabel = (i) => ['A', 'B', 'C', 'D'][i]

  // ── SKILL SELECTOR VIEW ──────────────────────────────────────────────────────
  if (!selectedSkill) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Question Bank</h2>
          <p className="text-slate-400 text-sm mt-1">
            Select a skill to manage its quiz questions
          </p>
        </div>

        {skillsLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : skills.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-20 text-slate-400">
              <BookOpen className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-medium">No skills found</p>
              <p className="text-sm mt-1">Add skills in the Skills Manager first</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map(skill => (
              <button
                key={skill.id}
                onClick={() => { setSelectedSkill(skill); setSearch('') }}
                className="group text-left p-5 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0 flex items-center justify-center">
                    {skill.coverImage ? (
                      <img
                        src={skill.coverImage}
                        alt={skill.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <BookOpen className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors leading-snug">
                      {skill.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge
                        variant="outline"
                        className="text-blue-400 border-blue-500/30 bg-blue-500/10 text-xs px-1.5 py-0"
                      >
                        {skill.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/60">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {skill.questionCount ?? 0} question{(skill.questionCount ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-xs text-blue-400 group-hover:underline">
                    Manage →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── QUESTIONS VIEW ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => { setSelectedSkill(null); setSearch('') }}
          className="text-slate-400 hover:text-white gap-2 px-2"
        >
          <ArrowLeft className="w-4 h-4" />
          All Skills
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{selectedSkill.name}</h2>
          <p className="text-slate-400 text-sm mt-1">
            {questions.length} question{questions.length !== 1 ? 's' : ''} in the bank
          </p>
        </div>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
        </CardContent>
      </Card>

      {questionsLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center py-20 text-slate-400">
            <HelpCircle className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">
              {questions.length === 0 ? 'No questions yet' : 'No questions match your search'}
            </p>
            <p className="text-sm mt-1">
              {questions.length === 0 ? 'Add your first question to get started' : 'Try a different keyword'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <Card key={q.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-xs font-bold">
                      {questions.indexOf(q) + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium leading-relaxed">{q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      {q.options?.map((opt, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                            i === q.correctIndex
                              ? 'bg-green-500/15 border border-green-500/30 text-green-300'
                              : 'bg-slate-700/50 border border-slate-600/50 text-slate-300'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            i === q.correctIndex ? 'bg-green-500/30 text-green-300' : 'bg-slate-600 text-slate-400'
                          }`}>
                            {optionLabel(i)}
                          </span>
                          <span className="flex-1 min-w-0 truncate">{opt}</span>
                          {i === q.correctIndex && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div className="mt-3 px-3 py-2 rounded-lg bg-slate-700/40 border border-slate-600/40">
                        <p className="text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">Explanation: </span>
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(q)} className="w-8 h-8 text-slate-400 hover:text-blue-400 hover:bg-slate-700">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => confirmDelete(q)} className="w-8 h-8 text-slate-400 hover:text-red-400 hover:bg-slate-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-1.5">
              <Label className="text-slate-300">Question <span className="text-red-400">*</span></Label>
              <Textarea
                value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })}
                placeholder="e.g. What does CSS stand for?"
                rows={3}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none"
              />
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-slate-300">Answer Options <span className="text-red-400">*</span></Label>
                <p className="text-xs text-slate-500 mt-0.5">Fill all 4 options, then click the correct one to mark it</p>
              </div>
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, correctIndex: i })}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all border-2 ${
                      form.correctIndex === i
                        ? 'bg-green-500/20 border-green-500 text-green-300 scale-110'
                        : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    {optionLabel(i)}
                  </button>
                  <Input
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    placeholder={`Option ${optionLabel(i)}`}
                    className={`bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 transition-colors ${
                      form.correctIndex === i ? 'border-green-500/50 bg-green-500/5' : ''
                    }`}
                  />
                  {form.correctIndex === i && (
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  )}
                </div>
              ))}
              {form.correctIndex !== null && (
                <p className="text-xs text-green-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Option {optionLabel(form.correctIndex)} marked as correct answer
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Explanation <span className="text-slate-500 font-normal">(optional)</span></Label>
              <Textarea
                value={form.explanation}
                onChange={e => setForm({ ...form, explanation: e.target.value })}
                placeholder="Brief explanation shown to the student after answering..."
                rows={2}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none"
              />
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
              ) : editingQuestion ? 'Save Changes' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}