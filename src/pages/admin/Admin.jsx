import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../firebase/auth'
import { useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, HelpCircle,
  Users, ClipboardList, Gift, Award,
  Briefcase, FolderOpen, Settings,
  LogOut, Menu, X, Home, CalendarCheck,
  FileText,
} from 'lucide-react'
import AdminOverview from './tabs/AdminOverview'
import SkillsManager from './tabs/SkillsManager'
import SkillPagesManager from './tabs/SkillPagesManager'
import QuestionBank from './tabs/QuestionBank'
import UsersManager from './tabs/UsersManager'
import QuizRecords from './tabs/QuizRecords'
import RewardManager from './tabs/RewardManager'
import CertificateManager from './tabs/CertificateManager'
import ExpertApplications from './tabs/ExpertApplications'
import FileManager from './tabs/FileManager'
import SiteContent from './tabs/SiteContent'
import BookingsManager from './tabs/BookingsManager'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'skills', label: 'Skills Manager', icon: BookOpen },
  { id: 'pages', label: 'Tutorial Pages', icon: FileText },
  { id: 'questions', label: 'Question Bank', icon: HelpCircle },
  { id: 'users', label: 'Users Manager', icon: Users },
  { id: 'records', label: 'Quiz Records', icon: ClipboardList },
  { id: 'rewards', label: 'Reward Requests', icon: Gift },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'bookings', label: 'Bookings Manager', icon: CalendarCheck },
  { id: 'applications', label: 'Expert Applications', icon: Briefcase },
  { id: 'files', label: 'File Manager', icon: FolderOpen },
  { id: 'content', label: 'Site Content', icon: Settings },
]

export default function Admin() {
  const { userData } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />
      case 'skills': return <SkillsManager />
      case 'pages': return <SkillPagesManager />
      case 'questions': return <QuestionBank />
      case 'users': return <UsersManager />
      case 'records': return <QuizRecords />
      case 'rewards': return <RewardManager />
      case 'certificates': return <CertificateManager />
      case 'bookings': return <BookingsManager />
      case 'applications': return <ExpertApplications />
      case 'files': return <FileManager />
      case 'content': return <SiteContent />
      default: return <AdminOverview />
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F2C] flex relative">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#060B1F]
          border-r border-white/10 flex flex-col
          transition-transform duration-300 z-30
          lg:relative lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10
          flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">
              Hubitcareer
            </h1>
            <p className="text-xs text-red-400 font-medium">
              Admin Panel
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/50 hover:text-white
              transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Admin info */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-500/20
              border border-red-500/30 flex items-center
              justify-center text-red-400 font-bold text-sm
              flex-shrink-0">
              {userData?.fullName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium
                truncate max-w-[140px]">
                {userData?.fullName || 'Admin User'}
              </p>
              <p className="text-red-400 text-xs font-medium">
                Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex-1 px-3 py-4 space-y-0.5
          overflow-y-auto scrollbar-thin scrollbar-track-transparent
          scrollbar-thumb-white/10">

          {/* Content section label */}
          <p className="px-4 pt-1 pb-2 text-[10px] font-bold
            text-white/25 uppercase tracking-widest">
            Content
          </p>
          {tabs.slice(0, 4).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id)
                setSidebarOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5
                rounded-xl text-sm font-medium transition-all
                ${activeTab === id
                  ? 'bg-[#2979FF] text-white shadow-lg shadow-blue-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'}
              `}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </button>
          ))}

          {/* Management section label */}
          <p className="px-4 pt-4 pb-2 text-[10px] font-bold
            text-white/25 uppercase tracking-widest">
            Management
          </p>
          {tabs.slice(4, 9).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id)
                setSidebarOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5
                rounded-xl text-sm font-medium transition-all
                ${activeTab === id
                  ? 'bg-[#2979FF] text-white shadow-lg shadow-blue-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'}
              `}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </button>
          ))}

          {/* System section label */}
          <p className="px-4 pt-4 pb-2 text-[10px] font-bold
            text-white/25 uppercase tracking-widest">
            System
          </p>
          {tabs.slice(9).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id)
                setSidebarOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5
                rounded-xl text-sm font-medium transition-all
                ${activeTab === id
                  ? 'bg-[#2979FF] text-white shadow-lg shadow-blue-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'}
              `}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-2.5
              rounded-xl text-sm font-medium text-white/50
              hover:text-white hover:bg-white/5 transition-all"
          >
            <Home size={16} />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5
              rounded-xl text-sm font-medium text-white/50
              hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-[#0A0F2C]/90
          backdrop-blur border-b border-white/10 px-6 py-4
          flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/50 hover:text-white
              transition-colors"
          >
            <Menu size={22} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-sm hidden sm:block">
              Admin
            </span>
            <span className="text-white/30 text-sm hidden sm:block">
              /
            </span>
            <h2 className="text-white font-semibold text-sm">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <span className="bg-red-500/10 border border-red-500/20
              text-red-400 text-xs px-3 py-1 rounded-full
              font-medium">
              Admin
            </span>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderTab()}
        </main>
      </div>
    </div>
  )
}