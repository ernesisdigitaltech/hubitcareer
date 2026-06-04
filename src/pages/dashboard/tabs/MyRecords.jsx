import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { db } from '../../../firebase/config'
import {
  collection, query, where, getDocs,
  orderBy, addDoc, updateDoc, doc
} from 'firebase/firestore'
import { ClipboardList, Trophy } from 'lucide-react'

const getGrade = (score) => {
  if (score >= 95) return { grade: 'A+ Expert', color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  if (score >= 85) return { grade: 'A Advanced', color: 'text-green-400', bg: 'bg-green-500/10' }
  if (score >= 75) return { grade: 'B Proficient', color: 'text-blue-400', bg: 'bg-blue-500/10' }
  if (score >= 70) return { grade: 'C Competent', color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
  if (score >= 10) return { grade: 'D Passed', color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
  return { grade: 'F Not Passed', color: 'text-red-400', bg: 'bg-red-500/10' }
}

const getScoreColor = (score) => {
  if (score >= 70) return 'text-green-400'
  if (score >= 10) return 'text-yellow-400'
  return 'text-red-400'
}

export default function MyRecords() {
  const { user, userData } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    fetchRecords()
  }, [user.uid])

  const fetchRecords = async () => {
    try {
      const q = query(
        collection(db, 'quizAttempts'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      const attempts = snap.docs.map(d => ({ id: d.id, ...d.data() }))

      // Get reward requests to check which ones already requested
      const rewardSnap = await getDocs(
        query(collection(db, 'rewardRequests'), where('userId', '==', user.uid))
      )
      const requestedSkills = rewardSnap.docs.map(d => d.data().quizAttemptId)

      setRecords(attempts.map(a => ({
        ...a,
        alreadyRequested: requestedSkills.includes(a.id)
      })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const requestReward = async (attempt) => {
    setRequesting(attempt.id)
    setMessage({ text: '', type: '' })
    try {
      await addDoc(collection(db, 'rewardRequests'), {
        userId: user.uid,
        userName: userData?.fullName,
        userEmail: userData?.email,
        skillId: attempt.skillId,
        skillName: attempt.skillName,
        quizAttemptId: attempt.id,
        score: attempt.score,
        grade: attempt.grade,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      setMessage({ text: `Reward requested for ${attempt.skillName}!`, type: 'success' })
      fetchRecords()
    } catch (err) {
      setMessage({ text: 'Failed to request reward. Try again.', type: 'error' })
    } finally {
      setRequesting(null)
    }
  }

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
        <ClipboardList size={20} className="text-[#2979FF]" />
        <h2 className="text-white font-semibold text-lg">My Quiz Records</h2>
        <span className="ml-auto bg-white/10 text-white/50 text-xs px-3 py-1 rounded-full">
          {records.length} attempt{records.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`text-sm rounded-lg px-4 py-3 ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Empty state */}
      {records.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <ClipboardList size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No quiz attempts yet.</p>
          <p className="text-white/25 text-xs mt-1">
            Complete a skill tutorial to unlock the quiz.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            const { grade, color, bg } = getGrade(record.score)
            const canRequest = record.score >= 10 && !record.alreadyRequested

            return (
              <div
                key={record.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                  {/* Skill info */}
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{record.skillName}</h4>
                    <p className="text-white/40 text-xs mt-1">
                      {new Date(record.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                      {record.timeTaken && ` · ${record.timeTaken}`}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${getScoreColor(record.score)}`}>
                        {record.score}%
                      </p>
                      <p className="text-white/30 text-xs">
                        {record.correct}/{record.total} correct
                      </p>
                    </div>

                    {/* Grade badge */}
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${bg} ${color}`}>
                      {grade}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="sm:w-36">
                    {record.score < 10 ? (
                      <span className="text-red-400/60 text-xs">
                        Below 10% threshold
                      </span>
                    ) : record.alreadyRequested ? (
                      <span className="flex items-center gap-1.5 text-green-400/70 text-xs">
                        <Trophy size={13} />
                        Reward Requested
                      </span>
                    ) : (
                      <button
                        onClick={() => requestReward(record)}
                        disabled={requesting === record.id}
                        className="w-full bg-[#2979FF]/20 hover:bg-[#2979FF]/40 text-[#2979FF] text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                      >
                        {requesting === record.id ? 'Requesting...' : 'Request Reward'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}