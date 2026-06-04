import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../../firebase/auth'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirm: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    if (!form.phone) return setError('Phone number is required')
    setLoading(true)
    try {
      await registerUser(form.email, form.password, form.fullName, form.phone)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F2C] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Hubitcareer</h1>
          <p className="text-white/50 mt-1 text-sm">Create your free account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-white/70 text-sm mb-1 block">Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handle}
              required
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#2979FF] transition"
            />
          </div>

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
            <label className="text-white/70 text-sm mb-1 block">Phone Number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handle}
              required
              placeholder="+234 800 000 0000"
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
              placeholder="Min. 6 characters"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#2979FF] transition"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-1 block">Confirm Password</label>
            <input
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handle}
              required
              placeholder="Repeat password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#2979FF] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2979FF] hover:bg-[#1a5fcc] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-white/40 text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2979FF] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}