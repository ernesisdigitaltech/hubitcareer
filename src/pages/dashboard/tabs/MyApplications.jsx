import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { db } from '../../../firebase/config'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { Briefcase, FileText, RotateCcw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const statusConfig = {
  'exam_pending': {
    label: 'Exam Pending',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon: Clock
  },
  'exam_failed': {
    label: 'Exam Failed',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: XCircle
  },
  'under_review': {
    label: 'Under Review',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: AlertCircle
  },
  'approved': {
    label: 'Approved',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: CheckCircle
  },
  'rejected': {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: XCircle
  }
}

export default function MyApplications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const q = query(
          collection(db, 'expertApplications'),
          where('userId', '==', user.uid),
          orderBy('appliedAt', 'desc')
        )
        const snap = await getDocs(q)
        setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
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
        <Briefcase size={20} className="text-[#2979FF]" />
        <h2 className="text-white font-semibold text-lg">My Applications</h2>
        <span className="ml-auto bg-white/10 text-white/50 text-xs px-3 py-1 rounded-full">
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty state */}
      {applications.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <Briefcase size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-medium">No applications yet.</p>
          <p className="text-white/25 text-xs mt-1 mb-5">
            Apply to become an expert tutor on any skill.
          </p>
          <button
            onClick={() => navigate('/careers')}
            className="bg-[#2979FF] hover:bg-[#1a5fcc] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition"
          >
            Browse Careers
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const config = statusConfig[app.status] || statusConfig.exam_pending
            const StatusIcon = config.icon

            return (
              <div
                key={app.id}
                className={`bg-white/5 border rounded-2xl overflow-hidden ${config.border}`}
              >
                {/* Top color bar */}
                <div className={`h-1.5 w-full ${
                  app.status === 'approved' ? 'bg-green-500' :
                  app.status === 'rejected' || app.status === 'exam_failed' ? 'bg-red-500' :
                  app.status === 'under_review' ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`} />

                <div className="p-5 space-y-4">

                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-white font-semibold">{app.skillName}</h4>
                      <p className="text-white/40 text-xs mt-0.5">
                        Applied {new Date(app.appliedAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.bg} ${config.color}`}>
                      <StatusIcon size={12} />
                      {config.label}
                    </span>
                  </div>

                  {/* Details row */}
                  <div className="flex flex-wrap items-center gap-3">

                    {/* CV file */}
                    {app.cvFileName && (
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs px-3 py-2 rounded-lg transition"
                      >
                        <FileText size={13} />
                        {app.cvFileName}
                      </a>
                    )}

                    {/* Exam score */}
                    {app.examScore !== undefined && (
                      <div className="flex items-center gap-2 bg-white/5 text-white/60 text-xs px-3 py-2 rounded-lg">
                        <span>Exam Score:</span>
                        <span className={`font-bold ${
                          app.examScore >= 75 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {app.examScore}%
                        </span>
                      </div>
                    )}

                    {/* Expert badge if approved */}
                    {app.status === 'approved' && (
                      <span className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full">
                        ⭐ Expert
                      </span>
                    )}
                  </div>

                  {/* Approved note */}
                  {app.status === 'approved' && app.adminNote && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                      <p className="text-green-400 text-xs font-medium mb-1">Admin Note</p>
                      <p className="text-green-300/80 text-sm">{app.adminNote}</p>
                    </div>
                  )}

                  {/* Rejected note */}
                  {app.status === 'rejected' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                      {app.adminNote && (
                        <>
                          <p className="text-red-400 text-xs font-medium mb-1">Reason</p>
                          <p className="text-red-300/80 text-sm">{app.adminNote}</p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Exam failed + retake */}
                  {app.status === 'exam_failed' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 space-y-2">
                      <p className="text-red-400 text-xs">
                        You did not meet the pass mark of {app.passMark || 75}%.
                      </p>
                      {app.retakeAllowed && (
                        <button
                          onClick={() => navigate(`/careers/${app.skillId}/apply`)}
                          className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition"
                        >
                          <RotateCcw size={13} />
                          Retake Exam
                        </button>
                      )}
                    </div>
                  )}

                  {/* Under review message */}
                  {app.status === 'under_review' && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3">
                      <p className="text-blue-300/80 text-sm">
                        Your application is being reviewed by our team. We'll notify you soon.
                      </p>
                    </div>
                  )}

                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}