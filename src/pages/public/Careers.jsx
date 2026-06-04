import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import {
  Briefcase, Search, ChevronRight, CheckCircle,
  FileText, FlaskConical, Star, Shield
} from 'lucide-react'

const howItWorks = [
  { step: '01', icon: Search, title: 'Browse Roles', desc: 'Find an expert tutor role that matches your skills and expertise.' },
  { step: '02', icon: FileText, title: 'Apply with CV', desc: 'Submit your application with your CV and a short bio statement.' },
  { step: '03', icon: FlaskConical, title: 'Take Skill Exam', desc: 'Pass the expert-level skill exam to prove your knowledge.' },
  { step: '04', icon: CheckCircle, title: 'Get Reviewed', desc: 'Our team reviews your application and gets back to you.' },
]

const benefits = [
  { icon: Star, title: 'Flexible', desc: 'Work on your own schedule from anywhere in Nigeria.' },
  { icon: Shield, title: 'Recognised', desc: 'Earn an Expert badge displayed on your profile.' },
  { icon: CheckCircle, title: 'Rewarded', desc: 'Get rewarded for your contribution to the community.' },
]

const categoryColors = {
  Design: 'text-pink-400 bg-pink-500/10',
  Development: 'text-blue-400 bg-blue-500/10',
  Marketing: 'text-orange-400 bg-orange-500/10',
  Business: 'text-yellow-400 bg-yellow-500/10',
  Data: 'text-cyan-400 bg-cyan-500/10',
  Writing: 'text-green-400 bg-green-500/10',
  Video: 'text-red-400 bg-red-500/10',
  Finance: 'text-emerald-400 bg-emerald-500/10',
  'AI Tools': 'text-purple-400 bg-purple-500/10',
}

export default function Careers() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [roles, setRoles] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const q = query(
          collection(db, 'careers'),
          where('active', '==', true)
        )
        const snap = await getDocs(q)
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setRoles(data)
        setFiltered(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRoles()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(roles)
    } else {
      setFiltered(roles.filter(r =>
        r.skillName?.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase())
      ))
    }
  }, [search, roles])

  const handleApply = (roleId) => {
    if (!user) {
      navigate('/login')
    } else {
      navigate(`/careers/${roleId}/apply`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white">

      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#2979FF]/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-medium">NOW HIRING</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Join the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2979FF] to-[#64B5F6]">
              Hubitcareer
            </span>
            {' '}Expert Team
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
            Share your digital expertise, teach tutorials to thousands of
            learners and earn recognition as a verified expert.
          </p>
          <a
            href="#roles"
            className="inline-flex items-center gap-2 bg-[#2979FF] hover:bg-[#1a5fcc] text-white font-semibold px-8 py-3 rounded-xl transition"
          >
            See Open Roles
            <ChevronRight size={16} />
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-white/40">Four steps from application to expert status.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {howItWorks.map(({ step, icon: Icon, title, desc }, index) => (
              <div key={step} className="relative">
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#2979FF]/40 to-transparent z-0" />
                )}
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 hover:border-[#2979FF]/30 transition">
                  <div className="w-10 h-10 bg-[#2979FF]/10 rounded-xl flex items-center justify-center">
                    <Icon size={18} className="text-[#2979FF]" />
                  </div>
                  <p className="text-[#2979FF] text-xs font-bold">{step}</p>
                  <h3 className="text-white font-semibold">{title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section id="roles" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Open Roles</h2>
              <p className="text-white/40 text-sm mt-1">
                {filtered.length} role{filtered.length !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search roles..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#2979FF] transition"
              />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl h-40 animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <Briefcase size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40 font-medium">No open roles at the moment.</p>
              <p className="text-white/25 text-sm mt-1">
                Check back soon — we add new roles regularly.
              </p>
            </div>
          )}

          {/* Roles grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((role) => (
                <div
                  key={role.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 hover:border-[#2979FF]/30 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <h3 className="text-white font-semibold">{role.skillName}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          categoryColors[role.category] || 'text-white/40 bg-white/5'
                        }`}>
                          {role.category}
                        </span>
                        <span className="text-white/30 text-xs bg-white/5 px-2.5 py-1 rounded-full">
                          Expert Exam Required
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white/30 text-xs">Pass Mark</p>
                      <p className="text-[#2979FF] font-bold">{role.passMark || 75}%</p>
                    </div>
                  </div>

                  {role.description && (
                    <p className="text-white/40 text-sm leading-relaxed line-clamp-2">
                      {role.description}
                    </p>
                  )}

                  <button
                    onClick={() => handleApply(role.id)}
                    className="w-full flex items-center justify-center gap-2 bg-[#2979FF]/10 hover:bg-[#2979FF]/20 border border-[#2979FF]/20 hover:border-[#2979FF]/40 text-[#2979FF] font-semibold text-sm py-2.5 rounded-xl transition"
                  >
                    Apply Now
                    <ChevronRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-white/[0.02] border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Why Become an Expert?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-3"
              >
                <div className="w-12 h-12 bg-[#2979FF]/10 rounded-xl flex items-center justify-center mx-auto">
                  <Icon size={20} className="text-[#2979FF]" />
                </div>
                <h3 className="text-white font-semibold">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}