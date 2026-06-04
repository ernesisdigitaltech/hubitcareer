import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../firebase/auth'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, ClipboardList,
  Gift, Award, Briefcase, User, LogOut,
  Menu, X, ShieldAlert
} from 'lucide-react'

// User tabs
import Overview from './tabs/Overview'
import MySkills from './tabs/MySkills'
import MyRecords from './tabs/MyRecords'
import RewardRequests from './tabs/RewardRequests'
import MyCertifications from './tabs/MyCertifications'
import MyApplications from './tabs/MyApplications'
import Profile from './tabs/Profile'

// Admin tabs
import AdminOverview from '../admin/tabs/AdminOverview'
import SkillsManager from '../admin/tabs/SkillsManager'
import QuestionBank from '../admin/tabs/QuestionBank'
import UsersManager from '../admin/tabs/UsersManager'
import QuizRecords from '../admin/tabs/QuizRecords'
import RewardManager from '../admin/tabs/RewardManager'
import CertificateManager from '../admin/tabs/CertificateManager'
import ExpertApplications from '../admin/tabs/ExpertApplications'
import FileManager from '../admin/tabs/FileManager'
import SiteContent from '../admin/tabs/SiteContent'

const userTabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'skills', label: 'My Skills', icon: BookOpen },
  { id: 'records', label: 'My Records', icon: ClipboardList },
  { id: 'rewards', label: 'Reward Requests', icon: Gift },
  { id: 'certifications', label: 'My Certifications', icon: Award },
  { id: 'applications', label: 'My Applications', icon: Briefcase },
  { id: 'profile', label: 'Profile', icon: User },
]

const adminTabs = [
  { id: 'admin_overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'admin_skills', label: 'Skills Manager', icon: BookOpen },
  { id: 'admin_questions', label: 'Question Bank', icon: ClipboardList },
  { id: 'admin_users', label: 'Users Manager', icon: User },
  { id: 'admin_records', label: 'Quiz Records', icon: ClipboardList },
  { id: 'admin_rewards', label: 'Reward Requests', icon: Gift },
  { id: 'admin_certificates', label: 'Certificates', icon: Award },
  { id: 'admin_applications', label: 'Expert Applications', icon: Briefcase },
  { id: 'admin_files', label: 'File Manager', icon: ShieldAlert },
  { id: 'admin_content', label: 'Site Content', icon: ShieldAlert },
]

export default function Dashboard() {
  const { userData } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
  }

  const switchToAdmin = () => {
    setIsAdminMode(true)
    setActiveTab('admin_overview')
    setSidebarOpen(false)
  }

  const switchToUser = () => {
    setIsAdminMode(false)
    setActiveTab('overview')
    setSidebarOpen(false)
  }

  const renderTab = () => {
    switch (activeTab) {
      // User tabs
      case 'overview': return <Overview />
      case 'skills': return <MySkills />
      case 'records': return <MyRecords />
      case 'rewards': return <RewardRequests />
      case 'certifications': return <MyCertifications />
      case 'applications': return <MyApplications />
      case 'profile': return <Profile />
      // Admin tabs
      case 'admin_overview': return <AdminOverview />
      case 'admin_skills': return <SkillsManager />
      case 'admin_questions': return <QuestionBank />
      case 'admin_users': return <UsersManager />
      case 'admin_records': return <QuizRecords />
      case 'admin_rewards': return <RewardManager />
      case 'admin_certificates': return <CertificateManager />
      case 'admin_applications': return <ExpertApplications />
      case 'admin_files': return <FileManager />
      case 'admin_content': return <SiteContent />
      default: return <Overview />
    }
  }

  const currentTabs = isAdminMode ? adminTabs : userTabs

  return (
    <div className="min-h-screen bg-[#0A0F2C] flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#060B1F] border-r border-white/10 z-30
        flex flex-col transition-transform duration-300
        lg:relative lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo + mode badge */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Hubitcareer</h1>
            {isAdminMode && (
              <p className="text-xs text-red-400 font-medium mt-0.5">
                Admin Panel
              </p>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/50 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              isAdminMode
                ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                : 'bg-[#2979FF]'
            }`}>
              {userData?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium truncate max-w-[140px]">
                {userData?.fullName}
              </p>
              <p className={`text-xs font-medium ${
                isAdminMode ? 'text-red-400' : 'text-white/40'
              }`}>
                {isAdminMode ? 'Administrator' : 'Student'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode switcher — only for admins */}
        {userData?.role === 'admin' && (
          <div className="px-3 pt-3">
            <button
              onClick={isAdminMode ? switchToUser : switchToAdmin}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                isAdminMode
                  ? 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              }`}
            >
              <ShieldAlert size={16} />
              {isAdminMode ? 'Switch to Student View' : 'Switch to Admin Panel'}
            </button>
          </div>
        )}

        {/* Nav tabs */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {currentTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(false) }}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition
                ${activeTab === id
                  ? isAdminMode
                    ? 'bg-red-500 text-white'
                    : 'bg-[#2979FF] text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'}
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className={`sticky top-0 z-10 backdrop-blur border-b px-6 py-4 flex items-center gap-4 ${
          isAdminMode
            ? 'bg-[#0A0F2C]/80 border-red-500/20'
            : 'bg-[#0A0F2C]/80 border-white/10'
        }`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/50 hover:text-white"
          >
            <Menu size={22} />
          </button>
          <h2 className="text-white font-semibold">
            {currentTabs.find(t => t.id === activeTab)?.label}
          </h2>
          {isAdminMode && (
            <span className="ml-auto bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full font-medium">
              Admin Mode
            </span>
          )}
        </header>

        {/* Tab content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderTab()}
        </main>
      </div>
    </div>
  )
}