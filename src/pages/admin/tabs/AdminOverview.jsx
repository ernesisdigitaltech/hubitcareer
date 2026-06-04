import { useEffect, useState } from 'react'
import { db } from '../../../firebase/config'
import {
  collection, getDocs, query,
  where, orderBy, limit
} from 'firebase/firestore'
import {
  Users, BookOpen, ClipboardList,
  Gift, TrendingUp, Clock
} from 'lucide-react'

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSkills: 0,
    quizzesToday: 0,
    pendingRewards: 0
  })
  const [recentRewards, setRecentRewards] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Total users
        const usersSnap = await getDocs(collection(db, 'users'))

        // Total skills
        const skillsSnap = await getDocs(collection(db, 'skills'))

        // Pending rewards
        const pendingSnap = await getDocs(
          query(collection(db, 'rewardRequests'),
            where('status', '==', 'pending'))
        )

        // Quizzes today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const quizSnap = await getDocs(collection(db, 'quizAttempts'))
        const todayQuizzes = quizSnap.docs.filter(d => {
          const date = new Date(d.data().createdAt)
          return date >= today
        })

        // Recent reward requests
        const rewardSnap = await getDocs(
          query(collection(db, 'rewardRequests'),
            orderBy('createdAt', 'desc'),
            limit(5))
        )

        // Recent users
        const recentUsersSnap = await getDocs(
          query(collection(db, 'users'),
            orderBy('createdAt', 'desc'),
            limit(5))
        )

        setStats({
          totalUsers: usersSnap.size,
          totalSkills: skillsSnap.size,
          quizzesToday: todayQuizzes.length,
          pendingRewards: pendingSnap.size
        })

        setRecentRewards(
          rewardSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        )

        setRecentUsers(
          recentUsersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        )
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Total Skills',
      value: stats.totalSkills,
      icon: BookOpen,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      label: 'Quizzes Today',
      value: stats.quizzesToday,
      icon: ClipboardList,
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    {
      label: 'Pending Rewards',
      value: stats.pendingRewards,
      icon: Gift,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10'
    },
  ]

  const statusColors = {
    pending: 'text-yellow-400 bg-yellow-500/10',
    approved: 'text-green-400 bg-green-500/10',
    rejected: 'text-red-400 bg-red-500/10'
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

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent reward requests */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Gift size={17} className="text-[#2979FF]" />
            <h3 className="text-white font-semibold">Recent Reward Requests</h3>
          </div>

          {recentRewards.length === 0 ? (
            <div className="text-center py-8">
              <Gift size={32} className="text-white/20 mx-auto mb-2" />
              <p className="text-white/30 text-sm">No reward requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRewards.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {req.userName}
                    </p>
                    <p className="text-white/40 text-xs truncate">
                      {req.skillName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-white/60 text-xs font-semibold">
                      {req.score}%
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      statusColors[req.status] || statusColors.pending
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent registrations */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={17} className="text-[#2979FF]" />
            <h3 className="text-white font-semibold">Recent Registrations</h3>
          </div>

          {recentUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users size={32} className="text-white/20 mx-auto mb-2" />
              <p className="text-white/30 text-sm">No users yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2979FF]/20 flex items-center justify-center text-[#2979FF] font-bold text-sm shrink-0">
                    {u.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">
                      {u.fullName}
                    </p>
                    <p className="text-white/40 text-xs truncate">
                      {u.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Clock size={11} className="text-white/30" />
                    <span className="text-white/30 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}