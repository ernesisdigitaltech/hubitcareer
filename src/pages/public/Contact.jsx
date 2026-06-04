import { useState } from 'react'
import { db } from '../../firebase/config'
import { addDoc, collection } from 'firebase/firestore'
import { Mail, MessageSquare, Clock, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', subject: '', message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.subject || !form.message) {
      return setError('Please fill in all fields.')
    }
    setLoading(true)
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...form,
        createdAt: new Date().toISOString(),
        read: false
      })
      setSuccess(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#2979FF] transition"

  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-white/40 max-w-xl mx-auto">
            Have a question or need help? We'd love to hear from you.
            Send us a message and we'll respond within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contact info */}
          <div className="space-y-4">

            {/* WhatsApp */}
            <a
              href="https://wa.me/2348000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 bg-white/5 border border-white/10 hover:border-green-500/30 rounded-2xl p-5 transition group"
            >
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                <MessageSquare size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">WhatsApp</p>
                <p className="text-white/40 text-xs mt-0.5">Chat with us directly</p>
                <p className="text-green-400 text-xs mt-1 group-hover:underline">
                  +234 807 794 2353
                </p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:ernesisdigitaltech@gmail.com"
              className="flex items-start gap-4 bg-white/5 border border-white/10 hover:border-[#2979FF]/30 rounded-2xl p-5 transition group"
            >
              <div className="w-10 h-10 bg-[#2979FF]/10 rounded-xl flex items-center justify-center shrink-0">
                <Mail size={18} className="text-[#2979FF]" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Email</p>
                <p className="text-white/40 text-xs mt-0.5">Send us an email</p>
                <p className="text-[#2979FF] text-xs mt-1 group-hover:underline">
                  ernesisdigitaltech@gmail.com
                </p>
              </div>
            </a>

            {/* Response time */}
            <div className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Clock size={18} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Response Time</p>
                <p className="text-white/40 text-xs mt-0.5">
                  We respond within 24 hours on business days.
                </p>
              </div>
            </div>

          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">

              {success ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl">Message Sent!</h3>
                  <p className="text-white/40 text-sm max-w-sm mx-auto">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-[#2979FF] text-sm hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <h3 className="text-white font-semibold text-lg mb-2">
                    Send a Message
                  </h3>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">
                        Full Name
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handle}
                        placeholder="John Doe"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1 block">
                        Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handle}
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-1 block">
                      Subject
                    </label>
                    <input
                      name="subject"
                      value={form.subject}
                      onChange={handle}
                      placeholder="What is your message about?"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-1 block">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handle}
                      rows={5}
                      placeholder="Write your message here..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full bg-[#2979FF] hover:bg-[#1a5fcc] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}