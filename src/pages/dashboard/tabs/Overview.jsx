import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { db } from '../../../firebase/config'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { BookOpen, ClipboardList, Gift, TrendingUp } from 'lucide-react'

export default function Overview() {
  const { user, userData } = useAuth()
  const [stats, setStats] = useState({
    skillsStarted: 0,
    quizzesTaken: 0,
    rewardsRequested: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Skills started
        const progressSnap = await getDocs(
          query(collection(db, 'progress'), where('userId', '==', user.uid))
        )

        // Quizzes taken
        const quizSnap = await getDocs(
          query(collection(db, 'quizAttempts'), where('userId', '==', user.uid))
        )

        // Rewards requested
        const rewardSnap = await getDocs(
          query(collection(db, 'rewardRequests'), where('userId', '==', user.uid))
        )

        // Recent activity (last 5 quiz attempts)
        const recentSnap = await getDocs(
          query(
            collection(db, 'quizAttempts'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(5)
          )
        )

        setStats({
          skillsStarted: progressSnap.size,
          quizzesTaken: quizSnap.size,
          rewardsRequested: rewardSnap.size
        })

        setRecentActivity(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user.uid])

  const statCards = [
    {
      label: 'Skills Started',
      value: stats.skillsStarted,
      icon: BookOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Quizzes Taken',
      value: stats.quizzesTaken,
      icon: ClipboardList,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      label: 'Rewards Requested',
      value: stats.rewardsRequested,
      icon: Gift,
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    }
  ]

  const getGradeColor = (score) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 10) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-[#2979FF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          Welcome back, {userData?.fullName?.split(' ')[0]} 👋
        </h2>
        <p className="text-white/40 mt-1 text-sm">
          Here's a summary of your learning progress.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4"
          >
            <div className={`${bg} p-3 rounded-xl`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-white/40 text-sm">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-[#2979FF]" />
          <h3 className="text-white font-semibold">Recent Quiz Activity</h3>
        </div>

        {recentActivity.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <ClipboardList size={36} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No quiz attempts yet.</p>
            <p className="text-white/25 text-xs mt-1">
              Complete a skill tutorial and take a quiz to see results here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-white text-sm font-medium">{item.skillName}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getGradeColor(item.score)}`}>
                    {item.score}%
                  </p>
                  <p className="text-white/40 text-xs">{item.grade}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}