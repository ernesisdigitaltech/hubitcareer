import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, resetPassword } from '../../firebase/auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginUser(form.email, form.password)
      // This sends all users straight to our new unified path
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!form.email) return setError('Enter your email above first')
    try {
      await resetPassword(form.email)
      setMessage('Password reset email sent! Check your inbox.')
      setError('')
    } catch (err) {
      setError('Could not send reset email. Check the address.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F2C] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Hubitcareer</h1>
          <p className="text-white/50 mt-1 text-sm">Welcome back</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3 mb-6">
            {message}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-white/70 text-sm mb-1 block">Email Address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              required
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#2979FF] transition"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-1 block">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              required
              placeholder="Your password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#2979FF] transition"
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={handleReset}
              className="text-[#2979FF] text-sm hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2979FF] hover:bg-[#1a5fcc] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-white/40 text-sm text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#2979FF] hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}