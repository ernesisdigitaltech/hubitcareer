import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase/config'
import { useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Admin from './pages/admin/Admin'
import PublicLayout from './components/layout/PublicLayout'
import Home from './pages/public/Home'
import Skills from './pages/public/Skills'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import Careers from './pages/public/Careers'
import Terms from './pages/public/Terms'
import Privacy from './pages/public/Privacy'
import SkillDetail from './pages/public/SkillDetail'
import TutorialReader from './pages/public/TutorialReader'
import QuizEngine from './pages/public/QuizEngine'
import ExpertApplicationForm from './pages/public/ExpertApplicationForm'

const Spinner = () => (
  <div className="min-h-screen bg-[#0A0F2C] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#2979FF] border-t-transparent rounded-full animate-spin" />
  </div>
)

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  const { userData, loading, dataLoading } = useAuth()

  // Dynamic Favicon and Global Metadata Asset Initialization
  useEffect(() => {
    async function initializeGlobalAssets() {
      try {
        const snap = await getDoc(doc(db, 'siteContent', 'branding'))
        if (snap.exists() && snap.data().faviconUrl) {
          const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
          link.type = 'image/x-icon'
          link.rel = 'icon'
          link.href = snap.data().faviconUrl
          document.getElementsByTagName('head')[0].appendChild(link)
        }
      } catch (err) {
        console.error("Static metadata assets injection failure:", err)
      }
    }
    initializeGlobalAssets()
  }, [])

  // Wait for auth verification and database role-checks to settle 
  // before resolving access switches on the dashboard route
  if (loading || dataLoading) {
    return <Spinner />
  }

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/skills" element={<PublicLayout><Skills /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/careers" element={<PublicLayout><Careers /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />

      {/* Skill Detail — public, wrapped in PublicLayout */}
      <Route path="/skills/:skillId" element={
        <PublicLayout><SkillDetail /></PublicLayout>
      } />

      {/* Expert Application Intake Form — protected, wrapped in PublicLayout */}
      <Route path="/careers/apply/:roleId" element={
        <ProtectedRoute>
          <PublicLayout><ExpertApplicationForm /></PublicLayout>
        </ProtectedRoute>
      } />

      {/* Tutorial Reader — protected, NO navbar/footer */}
      <Route path="/skills/:skillId/learn" element={
        <ProtectedRoute><TutorialReader /></ProtectedRoute>
      } />

      {/* Quiz Engine — protected, NO navbar/footer */}
      <Route path="/skills/:skillId/quiz" element={
        <ProtectedRoute><QuizEngine /></ProtectedRoute>
      } />

      {/* Unified Permanent Dashboard Route Configuration */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {userData?.role === 'admin' ? <Admin /> : <Dashboard />}
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}