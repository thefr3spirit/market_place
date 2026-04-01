import { useState } from 'react'
import toast from 'react-hot-toast'
import { HiMail, HiPhone, HiUser } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    username: user?.username || '',
    phone: user?.phone || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Profile updated')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

      <div className="card p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span className="text-primary-900 dark:text-primary-400 font-bold text-2xl">
              {user.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user.username}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input-field"
                minLength={3}
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="+256 ..."
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <HiUser className="w-5 h-5 text-gray-400" />
              <span>{user.username}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <HiMail className="w-5 h-5 text-gray-400" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <HiPhone className="w-5 h-5 text-gray-400" />
              <span>{user.phone || 'No phone set'}</span>
            </div>
            <button onClick={() => setEditing(true)} className="btn-outline mt-4">
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
