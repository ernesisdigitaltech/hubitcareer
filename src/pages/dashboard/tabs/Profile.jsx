import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { db } from '../../../firebase/config'
import { doc, updateDoc } from 'firebase/firestore'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '../../../firebase/config'
import { User, Phone, Mail, Lock, Calendar, ShieldCheck } from 'lucide-react'

export default function Profile() {
  const { user, userData } = useAuth()

  const [form, setForm] = useState({
    fullName: userData?.fullName || '',
    phone: userData?.phone || ''
  })

  const [passwords, setPasswords] = useState({
    current: '', newPass: '', confirm: ''
  })

  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' })
  const [passMsg, setPassMsg] = useState({ text: '', type: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passLoading, setPassLoading] = useState(false)

  const handleProfile = async () => {
    if (!form.fullName.trim()) return setProfileMsg({ text: 'Name cannot be empty', type: 'error' })
    setProfileLoading(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: form.fullName.trim(),
        phone: form.phone.trim()
      })
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' })
    } catch (err) {
      setProfileMsg({ text: 'Failed to update profile.', type: 'error' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePassword = async () => {
    setPassMsg({ text: '', type: '' })
    if (!passwords.current) return setPassMsg({ text: 'Enter your current password', type: 'error' })
    if (passwords.newPass.length < 6) return setPassMsg({ text: 'New password must be at least 6 characters', type: 'error' })
    if (passwords.newPass !== passwords.confirm) return setPassMsg({ text: 'Passwords do not match', type: 'error' })

    setPassLoading(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, passwords.current)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, passwords.newPass)
      setPassMsg({ text: 'Password changed successfully!', type: 'success' })
      setPasswords({ current: '', newPass: '', confirm: '' })
    } catch (err) {
      setPassMsg({ text: 'Current password is incorrect.', type: 'error' })
    } finally {
      setPassLoading(false)
    }
  }

  const memberSince = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : 'Unknown'

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#2979FF] transition"

  return (
    <div className="max-w-2xl space-y-6">

      {/* Avatar + Info */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#2979FF] flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {userData?.fullName?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-white text-lg font-semibold">{userData?.fullName}</h3>
          <p className="text-white/40 text-sm">{userData?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="bg-[#2979FF]/20 text-[#2979FF] text-xs px-3 py-1 rounded-full capitalize font-medium">
              {userData?.role}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize
              ${userData?.status === 'active'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'}`}>
              {userData?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Member since + email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <Calendar size={18} className="text-white/30" />
          <div>
            <p className="text-white/40 text-xs">Member Since</p>
            <p className="text-white text-sm font-medium">{memberSince}</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck size={18} className="text-white/30" />
          <div>
            <p className="text-white/40 text-xs">Account Status</p>
            <p className="text-white text-sm font-medium capitalize">{userData?.status}</p>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User size={18} className="text-[#2979FF]" />
          <h3 className="text-white font-semibold">Edit Profile</h3>
        </div>

        {profileMsg.text && (
          <div className={`text-sm rounded-lg px-4 py-3 ${
            profileMsg.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {profileMsg.text}
          </div>
        )}

        <div>
          <label className="text-white/60 text-sm mb-1 block">Full Name</label>
          <input
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
            className={inputClass}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="text-white/60 text-sm mb-1 block">Phone Number</label>
          <input
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
            placeholder="+234 800 000 0000"
          />
        </div>

        <div>
          <label className="text-white/60 text-sm mb-1 block">Email Address</label>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
            <Mail size={16} className="text-white/30" />
            <span className="text-white/40 text-sm">{userData?.email}</span>
            <span className="ml-auto text-xs text-white/25">Read only</span>
          </div>
        </div>

        <button
          onClick={handleProfile}
          disabled={profileLoading}
          className="bg-[#2979FF] hover:bg-[#1a5fcc] text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
        >
          {profileLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={18} className="text-[#2979FF]" />
          <h3 className="text-white font-semibold">Change Password</h3>
        </div>

        {passMsg.text && (
          <div className={`text-sm rounded-lg px-4 py-3 ${
            passMsg.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {passMsg.text}
          </div>
        )}

        <div>
          <label className="text-white/60 text-sm mb-1 block">Current Password</label>
          <input
            type="password"
            value={passwords.current}
            onChange={e => setPasswords({ ...passwords, current: e.target.value })}
            className={inputClass}
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="text-white/60 text-sm mb-1 block">New Password</label>
          <input
            type="password"
            value={passwords.newPass}
            onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
            className={inputClass}
            placeholder="Min. 6 characters"
          />
        </div>

        <div>
          <label className="text-white/60 text-sm mb-1 block">Confirm New Password</label>
          <input
            type="password"
            value={passwords.confirm}
            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
            className={inputClass}
            placeholder="Repeat new password"
          />
        </div>

        <button
          onClick={handlePassword}
          disabled={passLoading}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
        >
          {passLoading ? 'Updating...' : 'Update Password'}
        </button>
      </div>

    </div>
  )
}