import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { db } from '../../../firebase/config'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { Award, Download, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const getGradeColor = (score) => {
  if (score >= 95) return 'text-emerald-400'
  if (score >= 85) return 'text-green-400'
  if (score >= 75) return 'text-blue-400'
  return 'text-cyan-400'
}

export default function MyCertifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const q = query(
          collection(db, 'certificates'),
          where('userId', '==', user.uid),
          orderBy('issuedAt', 'desc')
        )
        const snap = await getDocs(q)
        setCertificates(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCerts()
  }, [user.uid])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-[#2979FF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Award size={20} className="text-[#2979FF]" />
        <h2 className="text-white font-semibold text-lg">My Certifications</h2>
        <span className="ml-auto bg-white/10 text-white/50 text-xs px-3 py-1 rounded-full">
          {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty state */}
      {certificates.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <Award size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-medium">No certificates yet.</p>
          <p className="text-white/25 text-xs mt-1 mb-5">
            Score 80% or above on a quiz and request a certificate.
          </p>
          <button
            onClick={() => navigate('/skills')}
            className="bg-[#2979FF] hover:bg-[#1a5fcc] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition"
          >
            Browse Skills
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden group"
            >
              {/* Background cover image */}
              {cert.skillCover ? (
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={cert.skillCover}
                    alt={cert.skillName}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0F2C]" />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-[#2979FF]/20 to-[#0A0F2C]" />
              )}

              {/* Certified badge */}
              <div className="absolute top-3 right-3">
                <span className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Award size={11} />
                  CERTIFIED
                </span>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <h4 className="text-white font-semibold leading-tight">
                  {cert.skillName}
                </h4>

                <div className="flex items-center gap-3">
                  <div className="bg-white/5 rounded-lg px-3 py-1.5 text-center">
                    <p className={`font-bold text-base ${getGradeColor(cert.score)}`}>
                      {cert.score}%
                    </p>
                    <p className="text-white/30 text-xs">Score</p>
                  </div>
                  <div className="bg-white/5 rounded-lg px-3 py-1.5 text-center">
                    <p className="text-white font-bold text-sm">{cert.grade}</p>
                    <p className="text-white/30 text-xs">Grade</p>
                  </div>
                  <div className="bg-white/5 rounded-lg px-3 py-1.5 text-center flex-1">
                    <p className="text-white/60 text-xs">
                      {new Date(cert.issuedAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                    <p className="text-white/30 text-xs">Issued</p>
                  </div>
                </div>

                {/* Download button */}
                {cert.pdfUrl ? (
                  <a
                    href={cert.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#2979FF]/20 hover:bg-[#2979FF]/40 text-[#2979FF] text-sm font-semibold py-2.5 rounded-lg transition"
                  >
                    <Download size={15} />
                    Download Certificate
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 w-full bg-white/5 text-white/30 text-sm py-2.5 rounded-lg">
                    <Download size={15} />
                    PDF not available yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}