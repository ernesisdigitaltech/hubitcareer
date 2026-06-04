import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../firebase/config'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import {
  ArrowRight, BookOpen, CheckCircle, Trophy,
  Star, Zap, Users, Award, ChevronRight
} from 'lucide-react'

const stats = [
  { label: '100+ Skills', icon: BookOpen },
  { label: 'Free to Learn', icon: CheckCircle },
  { label: 'Instant Results', icon: Zap },
  { label: 'Rewards System', icon: Trophy },
]

const howItWorks = [
  { step: '01', title: 'Create Account', desc: 'Sign up for free in under a minute. No credit card required.' },
  { step: '02', title: 'Study the Tutorial', desc: 'Read through expertly written skill tutorials at your own pace.' },
  { step: '03', title: 'Take the Quiz', desc: 'Prove your knowledge with our timed 50-question quiz system.' },
  { step: '04', title: 'Request Reward', desc: 'Score 10%+ to request a reward. Score 80%+ to earn a certificate.' },
]

const benefits = [
  { icon: '🎓', title: 'Learn Any Digital Skill', desc: 'From design to coding, marketing to finance — 100+ skills covered.' },
  { icon: '⚡', title: 'Instant Quiz Results', desc: 'Get your score, grade and feedback the moment you finish.' },
  { icon: '🏆', title: 'Earn Real Rewards', desc: 'Your scores unlock rewards and certificates you can show anywhere.' },
]

export default function Home() {
  const [featuredSkills, setFeaturedSkills] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [openRoles, setOpenRoles] = useState([])

  useEffect(() => {
    // Fetch featured skills
    const fetchSkills = async () => {
      try {
        const q = query(
          collection(db, 'skills'),
          where('visible', '==', true),
          limit(6)
        )
        const snap = await getDocs(q)
        setFeaturedSkills(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      }
    }

    // Fetch testimonials
    const fetchTestimonials = async () => {
      try {
        const snap = await getDocs(collection(db, 'siteContent'))
        const doc = snap.docs.find(d => d.id === 'testimonials')
        if (doc) setTestimonials(doc.data().items || [])
      } catch (err) {
        console.error(err)
      }
    }

    // Fetch open roles
    const fetchRoles = async () => {
      try {
        const q = query(
          collection(db, 'careers'),
          where('active', '==', true),
          limit(3)
        )
        const snap = await getDocs(q)
        setOpenRoles(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      }
    }

    fetchSkills()
    fetchTestimonials()
    fetchRoles()
  }, [])

  return (
    <div className="text-white">

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F2C] via-[#0d1535] to-[#0A0F2C]" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#2979FF]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#2979FF]/5 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-full px-4 py-2 mb-6">
            <Zap size={14} className="text-[#2979FF]" />
            <span className="text-[#2979FF] text-sm font-medium">
              100+ Digital Skills — Free Forever
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Master{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2979FF] to-[#64B5F6]">
              100+ Digital Skills
            </span>
            {' '}That Matter
          </h1>

          <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Learn in-demand digital skills, prove your knowledge with quizzes,
            and earn rewards and certificates — completely free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-[#2979FF] hover:bg-[#1a5fcc] text-white font-semibold px-8 py-4 rounded-xl transition text-base"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/skills"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-xl transition text-base"
            >
              Browse Skills
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* Floating skill badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
            {['Design', 'Development', 'Marketing', 'Data', 'Finance', 'AI Tools', 'Writing', 'Video'].map(tag => (
              <span
                key={tag}
                className="bg-white/5 border border-white/10 text-white/50 text-xs px-3 py-1.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#2979FF]/10 border-y border-[#2979FF]/20 py-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center justify-center gap-3">
                <Icon size={20} className="text-[#2979FF]" />
                <span className="text-white font-semibold text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED SKILLS ── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Featured Skills</h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Start with our most popular skills and build your digital expertise today.
            </p>
          </div>

          {featuredSkills.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#2979FF]/40 hover:shadow-lg hover:shadow-[#2979FF]/10 hover:-translate-y-1 transition-all duration-300 group"
                >
                  {/* Cover */}
                  <div className="h-40 bg-gradient-to-br from-[#2979FF]/20 to-[#0A0F2C] overflow-hidden">
                    {skill.coverImage && (
                      <img
                        src={skill.coverImage}
                        alt={skill.name}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition"
                      />
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#2979FF]/10 text-[#2979FF] text-xs font-medium px-2.5 py-1 rounded-full">
                        {skill.category}
                      </span>
                      <span className="bg-white/5 text-white/40 text-xs px-2.5 py-1 rounded-full">
                        {skill.difficulty}
                      </span>
                    </div>

                    <h3 className="text-white font-semibold leading-tight">{skill.name}</h3>

                    <p className="text-white/40 text-sm line-clamp-2">{skill.description}</p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-white/30 text-xs">{skill.duration}</span>
                      <Link
                        to={`/skills/${skill.id}`}
                        className="text-[#2979FF] hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                      >
                        Start Learning
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/skills"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3 rounded-xl transition"
            >
              View All Skills
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-white/40">Four simple steps to start earning rewards.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map(({ step, title, desc }, index) => (
              <div key={step} className="relative">
                {/* Connector line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#2979FF]/40 to-transparent z-0" />
                )}
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#2979FF]/30 transition">
                  <div className="w-12 h-12 rounded-xl bg-[#2979FF]/10 border border-[#2979FF]/20 flex items-center justify-center">
                    <span className="text-[#2979FF] font-bold text-sm">{step}</span>
                  </div>
                  <h3 className="text-white font-semibold">{title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Why Hubitcareer?</h2>
            <p className="text-white/40">Everything you need to grow your digital skills.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {benefits.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-3 hover:border-[#2979FF]/30 transition"
              >
                <div className="text-4xl">{icon}</div>
                <h3 className="text-white font-semibold">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN EXPERT TEAM ── */}
      {openRoles.length > 0 && (
        <section className="py-20 px-4 bg-white/[0.02]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">NOW HIRING</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                Become a Hubitcareer Expert Tutor
              </h2>
              <p className="text-white/40 max-w-xl mx-auto">
                Share your expertise, teach live tutorials and get rewarded.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {openRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-[#2979FF]/10 text-[#2979FF] text-xs font-medium px-2.5 py-1 rounded-full">
                      {role.category}
                    </span>
                    <span className="text-white/30 text-xs">Pass: {role.passMark || 75}%</span>
                  </div>
                  <h4 className="text-white font-semibold">{role.skillName}</h4>
                  <p className="text-white/30 text-xs">Expert Exam Required</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/careers"
                className="inline-flex items-center gap-2 bg-[#2979FF] hover:bg-[#1a5fcc] text-white font-semibold px-8 py-3 rounded-xl transition"
              >
                Apply Now
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">What Learners Say</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(t.stars || 5)].map((_, s) => (
                      <Star key={s} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">"{t.quote}"</p>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-white/30 text-xs">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-[#2979FF] to-[#1a5fcc] rounded-3xl p-10 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto">
                Join thousands of learners mastering digital skills for free.
                No fees. No limits. Just learning.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-[#2979FF] font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition text-base"
              >
                Join Free Today
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}