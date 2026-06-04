import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../firebase/auth'
import { Menu, X, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Skills', path: '/skills' },
  { label: 'Careers', path: '/careers' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const { user, userData } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F2C]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-white hover:text-[#2979FF] transition">
            Hubitcareer
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(path)
                    ? 'text-[#2979FF] bg-[#2979FF]/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-[#2979FF] flex items-center justify-center text-white text-xs font-bold">
                    {userData?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-medium">
                    {userData?.fullName?.split(' ')[0]}
                  </span>
                  <ChevronDown size={15} className="text-white/40" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-[#060B1F] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 text-sm transition"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>
                      {userData?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 text-sm transition"
                        >
                          <LayoutDashboard size={15} />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 text-sm transition"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white/60 hover:text-white text-sm font-medium transition px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#2979FF] hover:bg-[#1a5fcc] text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/60 hover:text-white transition"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#060B1F] border-t border-white/10 px-4 py-4 space-y-1">
          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition ${
                isActive(path)
                  ? 'text-[#2979FF] bg-[#2979FF]/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}

          <div className="pt-3 border-t border-white/10 space-y-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-sm transition"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                {userData?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-sm transition"
                  >
                    <LayoutDashboard size={15} />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-lg text-sm transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 bg-[#2979FF] hover:bg-[#1a5fcc] text-white rounded-lg text-sm font-semibold text-center transition"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}