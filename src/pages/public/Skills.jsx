import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { Search, BookOpen, ChevronRight } from 'lucide-react'

const categories = [
  'All', 'Design', 'Development', 'Marketing',
  'Business', 'Data', 'Writing', 'Video',
  'Photography', 'Music', 'AI Tools', 'Finance'
]

const difficultyColor = {
  Beginner: 'text-green-400 bg-green-500/10',
  Intermediate: 'text-yellow-400 bg-yellow-500/10',
  Advanced: 'text-red-400 bg-red-500/10',
}

export default function Skills() {
  const [skills, setSkills] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const q = query(
          collection(db, 'skills'),
          where('visible', '==', true)
        )
        const snap = await getDocs(q)
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setSkills(data)
        setFiltered(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSkills()
  }, [])

  useEffect(() => {
    let result = skills
    if (activeCategory !== 'All') {
      result = result.filter(s => s.category === activeCategory)
    }
    if (search.trim()) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
      )
    }
    setFiltered(result)
  }, [search, activeCategory, skills])

  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Browse Skills</h1>
          <p className="text-white/40 max-w-xl mx-auto">
            Explore 100+ digital skills across every category. All free to learn.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#2979FF] transition"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-[#2979FF] text-white'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-white/40 text-sm">
            {filtered.length} skill{filtered.length !== 1 ? 's' : ''} found
          </p>
          {(search || activeCategory !== 'All') && (
            <button
              onClick={() => { setSearch(''); setActiveCategory('All') }}
              className="text-[#2979FF] text-sm hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-medium">No skills found.</p>
            <p className="text-white/25 text-sm mt-1">
              Try a different search term or category.
            </p>
          </div>
        )}

        {/* Skills grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((skill) => (
              <div
                key={skill.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#2979FF]/40 hover:shadow-lg hover:shadow-[#2979FF]/10 hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Cover image */}
                <div className="h-44 bg-gradient-to-br from-[#2979FF]/20 to-[#0A0F2C] overflow-hidden">
                  {skill.coverImage ? (
                    <img
                      src={skill.coverImage}
                      alt={skill.name}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={40} className="text-white/10" />
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#2979FF]/10 text-[#2979FF] text-xs font-medium px-2.5 py-1 rounded-full">
                      {skill.category}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      difficultyColor[skill.difficulty] || 'text-white/40 bg-white/5'
                    }`}>
                      {skill.difficulty}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-white font-semibold leading-tight">
                    {skill.name}
                  </h3>

                  {/* Description */}
                  <p className="text-white/40 text-sm line-clamp-2">
                    {skill.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-white/30 text-xs">{skill.duration}</span>
                    <Link
                      to={`/skills/${skill.id}`}
                      className="flex items-center gap-1 text-[#2979FF] hover:text-white text-xs font-semibold transition"
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
      </div>
    </div>
  )
}