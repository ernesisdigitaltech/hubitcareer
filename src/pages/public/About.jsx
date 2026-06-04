import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle, Trophy, Users, Zap, Globe } from 'lucide-react'

const values = [
  {
    icon: BookOpen,
    title: 'Learn Free',
    desc: 'Every skill, every tutorial, every quiz — completely free. No subscriptions, no hidden fees, ever.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10'
  },
  {
    icon: CheckCircle,
    title: 'Test Yourself',
    desc: 'Our timed quiz engine challenges you to prove real understanding, not just surface-level knowledge.',
    color: 'text-green-400',
    bg: 'bg-green-500/10'
  },
  {
    icon: Trophy,
    title: 'Earn Rewards',
    desc: 'Your hard work pays off. Earn rewards and certificates you can share with employers and clients.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10'
  },
]

const stats = [
  { value: '100+', label: 'Digital Skills', icon: BookOpen },
  { value: '₦0', label: 'Cost to Learn', icon: Zap },
  { value: 'Instant', label: 'Quiz Results', icon: CheckCircle },
  { value: 'Real', label: 'Rewards', icon: Trophy },
]

const teamValues = [
  { icon: Globe, title: 'Built in Nigeria', desc: 'Proudly built in Calabar, Cross River State by Ernesis Digital Tech.' },
  { icon: Users, title: 'Community First', desc: 'We believe every Nigerian deserves access to world-class digital education.' },
  { icon: Zap, title: 'Always Improving', desc: 'We continuously add new skills, features and improvements based on user feedback.' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white">

      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-[#2979FF]/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-full px-4 py-2 mb-6">
            <Globe size={14} className="text-[#2979FF]" />
            <span className="text-[#2979FF] text-sm font-medium">
              Ernesis Digital Tech — Calabar, Nigeria
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Our Mission is to Make{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2979FF] to-[#64B5F6]">
              Digital Skills Accessible
            </span>
            {' '}to Everyone
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-2xl mx-auto">
            Hubitcareer was built with one purpose — to give every person,
            regardless of background or budget, the tools to learn, prove
            and be rewarded for their digital skills.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center space-y-2">
                <Icon size={22} className="text-[#2979FF] mx-auto" />
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-white/40 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-bold">Our Vision</h2>
              <p className="text-white/50 leading-relaxed">
                We envision a Nigeria — and an Africa — where digital skills are
                not a privilege of the few, but a right of the many. Where anyone
                with a smartphone and the drive to learn can compete globally.
              </p>
              <p className="text-white/50 leading-relaxed">
                Hubitcareer is our contribution to that vision. A platform where
                learning is free, results are instant, and hard work is rewarded.
              </p>
              <Link
                to="/skills"
                className="inline-flex items-center gap-2 bg-[#2979FF] hover:bg-[#1a5fcc] text-white font-semibold px-6 py-3 rounded-xl transition"
              >
                Start Learning Today
              </Link>
            </div>

            {/* Visual card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
              <div className="w-12 h-12 bg-[#2979FF]/10 rounded-xl flex items-center justify-center">
                <BookOpen size={22} className="text-[#2979FF]" />
              </div>
              <h3 className="text-white font-bold text-xl">What We Offer</h3>
              {[
                '100+ digital skill tutorials',
                'Timed quiz engine with instant grading',
                'Reward system for passing scores',
                'Certificates for high achievers',
                'Expert tutor application system',
                'Zero cost — always free',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-[#2979FF] shrink-0" />
                  <span className="text-white/60 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Our Core Values</h2>
            <p className="text-white/40">The principles that guide everything we build.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#2979FF]/30 transition"
              >
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={22} className={color} />
                </div>
                <h3 className="text-white font-semibold text-lg">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team values */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">About Ernesis Digital Tech</h2>
            <p className="text-white/40 max-w-xl mx-auto">
              The team behind Hubitcareer, based in Calabar, Cross River State, Nigeria.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {teamValues.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 text-center hover:border-[#2979FF]/30 transition"
              >
                <div className="w-12 h-12 bg-[#2979FF]/10 rounded-xl flex items-center justify-center mx-auto">
                  <Icon size={22} className="text-[#2979FF]" />
                </div>
                <h3 className="text-white font-semibold">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-[#2979FF] to-[#1a5fcc] rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Hubitcareer Today</h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              Be part of a growing community of digital learners across Nigeria and beyond.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="bg-white text-[#2979FF] font-bold px-8 py-3 rounded-xl hover:bg-white/90 transition"
              >
                Create Free Account
              </Link>
              <Link
                to="/skills"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl transition"
              >
                Browse Skills
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}