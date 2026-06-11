'use client'

import { useState, useTransition, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, Loader2, ShieldAlert } from 'lucide-react'

const MAX_ATTEMPTS  = 5
const LOCKOUT_MS    = 15 * 60 * 1000   // 15 minutes
const STORAGE_KEY   = 'tpg_login_attempts'

interface AttemptData { count: number; lockedUntil: number | null }

function getAttemptData(): AttemptData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { count: 0, lockedUntil: null }
    return JSON.parse(raw) as AttemptData
  } catch { return { count: 0, lockedUntil: null } }
}

function saveAttemptData(data: AttemptData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function clearAttemptData() {
  localStorage.removeItem(STORAGE_KEY)
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]   = useState('')
  const [form, setForm]     = useState({ email: '', password: '' })
  const [lockedUntil, setLockedUntil]   = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState('')
  const [attemptsLeft, setAttemptsLeft]   = useState(MAX_ATTEMPTS)

  // On mount — check if already locked
  useEffect(() => {
    const data = getAttemptData()
    if (data.lockedUntil && data.lockedUntil > Date.now()) {
      setLockedUntil(data.lockedUntil)
    } else if (data.lockedUntil && data.lockedUntil <= Date.now()) {
      clearAttemptData()
    } else {
      setAttemptsLeft(MAX_ATTEMPTS - data.count)
    }
  }, [])

  // Countdown timer while locked
  useEffect(() => {
    if (!lockedUntil) return
    const interval = setInterval(() => {
      const diff = lockedUntil - Date.now()
      if (diff <= 0) {
        clearAttemptData()
        setLockedUntil(null)
        setAttemptsLeft(MAX_ATTEMPTS)
        setError('')
        clearInterval(interval)
      } else {
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setRemainingTime(`${mins}:${secs.toString().padStart(2, '0')}`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [lockedUntil])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Check lockout
    const data = getAttemptData()
    if (data.lockedUntil && data.lockedUntil > Date.now()) {
      setLockedUntil(data.lockedUntil)
      return
    }

    startTransition(async () => {
      const res = await signIn('credentials', {
        email:    form.email,
        password: form.password,
        redirect: false,
      })

      if (res?.error) {
        const fresh = getAttemptData()
        const newCount = (fresh.count || 0) + 1

        if (newCount >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_MS
          saveAttemptData({ count: newCount, lockedUntil: until })
          setLockedUntil(until)
          setAttemptsLeft(0)
          setError('')
        } else {
          saveAttemptData({ count: newCount, lockedUntil: null })
          setAttemptsLeft(MAX_ATTEMPTS - newCount)
          setError(`Invalid email or password. ${MAX_ATTEMPTS - newCount} attempt${MAX_ATTEMPTS - newCount === 1 ? '' : 's'} remaining.`)
        }
      } else {
        clearAttemptData()
        router.push('/admin')
        router.refresh()
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center relative overflow-hidden">

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/50 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon-32x32.png" alt="TechPulseGlobe" width={24} height={24} />
            </div>
            <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-md" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            TechPulse<span className="text-blue-400">Globe</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#0f0f1a]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your CMS dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Lockout Banner */}
            {lockedUntil && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 text-sm font-semibold">Account temporarily locked</p>
                  <p className="text-red-400/70 text-xs mt-0.5">
                    Too many failed attempts. Try again in{' '}
                    <span className="font-mono font-bold text-red-400">{remainingTime}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && !lockedUntil && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Attempts warning */}
            {!lockedUntil && attemptsLeft < MAX_ATTEMPTS && attemptsLeft > 0 && (
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <p className="text-yellow-400 text-xs">{attemptsLeft} attempt{attemptsLeft === 1 ? '' : 's'} remaining before lockout</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@techpulseglobe.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending || !!lockedUntil}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          TechPulseGlobe CMS v1.0 &mdash; Admin Only
        </p>
      </div>
    </div>
  )
}
