import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { db } from '../../../firebase/config'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { Gift, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react'

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon: Clock
  },
  approved: {
    label: 'Approved',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: CheckCircle
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: XCircle
  }
}

export default function RewardRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, 'rewardRequests'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
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
        <Gift size={20} className="text-[#2979FF]" />
        <h2 className="text-white font-semibold text-lg">Reward Requests</h2>
        <span className="ml-auto bg-white/10 text-white/50 text-xs px-3 py-1 rounded-full">
          {requests.length} request{requests.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty state */}
      {requests.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <Gift size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No reward requests yet.</p>
          <p className="text-white/25 text-xs mt-1">
            Score 10% or above on any quiz to request a reward.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {requests.map((req) => {
            const config = statusConfig[req.status] || statusConfig.pending
            const StatusIcon = config.icon

            return (
              <div
                key={req.id}
                className={`bg-white/5 border rounded-2xl overflow-hidden ${config.border}`}
              >
                {/* Top color bar */}
                <div className={`h-1.5 w-full ${
                  req.status === 'approved' ? 'bg-green-500' :
                  req.status === 'rejected' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`} />

                <div className="p-5 space-y-4">

                  {/* Skill name + status */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-white font-semibold leading-tight">
                      {req.skillName}
                    </h4>
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${config.bg} ${config.color}`}>
                      <StatusIcon size={12} />
                      {config.label}
                    </span>
                  </div>

                  {/* Score + grade */}
                  <div className="flex items-center gap-3">
                    <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                      <p className="text-white font-bold text-lg">{req.score}%</p>
                      <p className="text-white/30 text-xs">Score</p>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2 text-center">
                      <p className="text-white font-bold text-sm">{req.grade}</p>
                      <p className="text-white/30 text-xs">Grade</p>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2 text-center flex-1">
                      <p className="text-white/60 text-xs">
                        {new Date(req.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                      <p className="text-white/30 text-xs">Requested</p>
                    </div>
                  </div>

                  {/* Admin note for approved */}
                  {req.status === 'approved' && req.adminNote && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
                      <p className="text-green-400 text-xs font-medium mb-1">
                        Admin Note
                      </p>
                      <p className="text-green-300/80 text-sm">{req.adminNote}</p>
                    </div>
                  )}

                  {/* Rejection note + retake */}
                  {req.status === 'rejected' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 space-y-2">
                      {req.adminNote && (
                        <>
                          <p className="text-red-400 text-xs font-medium">
                            Reason
                          </p>
                          <p className="text-red-300/80 text-sm">{req.adminNote}</p>
                        </>
                      )}
                      <button
                        onClick={() => window.location.href = `/skills/${req.skillId}/quiz`}
                        className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition mt-1"
                      >
                        <RotateCcw size={13} />
                        Retake Quiz
                      </button>
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