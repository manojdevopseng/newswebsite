'use client'

import { useState } from 'react'
import {
  Globe, Shield, Database, Bell,
  Eye, EyeOff, Check, Copy, Key,
  Info, Search,
} from 'lucide-react'
import { toast } from 'sonner'

const inputCls = "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
const labelCls = "block text-xs font-medium text-slate-400 mb-1.5"

function Section({ icon: Icon, title, description, children }: {
  icon: any; title: string; description: string; children: React.ReactNode
}) {
  return (
    <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

function EnvRow({ label, envKey, value }: { label: string; envKey: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const [show,   setShow]   = useState(false)

  function copy() {
    navigator.clipboard.writeText(value || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied')
  }

  const masked = value ? '•'.repeat(Math.min(value.length, 24)) : '(not set)'

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-xs text-slate-600 font-mono">{envKey}</p>
      </div>
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 flex-1">
        <span className={`text-xs font-mono flex-1 truncate ${value ? 'text-slate-300' : 'text-slate-600'}`}>
          {show ? (value || '(not set)') : masked}
        </span>
        {value && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setShow(s => !s)} className="text-slate-500 hover:text-white transition-colors">
              {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button onClick={copy} className="text-slate-500 hover:text-white transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
      <span className={`shrink-0 w-2 h-2 rounded-full ${value ? 'bg-green-400' : 'bg-red-400/60'}`} />
    </div>
  )
}

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState('')
  const [showPw,      setShowPw]      = useState(false)

  const envVars = [
    { label: 'MongoDB URI',          envKey: 'MONGODB_URI',             value: process.env.NEXT_PUBLIC_MONGO_SET ? 'configured' : '' },
    { label: 'S3 Bucket',            envKey: 'S3_BUCKET',               value: process.env.NEXT_PUBLIC_S3_BUCKET || '' },
    { label: 'AWS Region',           envKey: 'S3_REGION',               value: process.env.NEXT_PUBLIC_AWS_REGION || '' },
    { label: 'Site URL',             envKey: 'NEXT_PUBLIC_URL',         value: process.env.NEXT_PUBLIC_URL || '' },
    { label: 'Auth Secret',          envKey: 'AUTH_SECRET',             value: 'configured' },
  ]

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Platform configuration and environment info</p>
      </div>

      {/* Site Info */}
      <Section icon={Globe} title="Site Information" description="Public-facing metadata">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Site Name</label>
            <input defaultValue="TechPulseGlobe" readOnly className={inputCls + ' opacity-60 cursor-not-allowed'} />
          </div>
          <div>
            <label className={labelCls}>Tagline</label>
            <input defaultValue="AI · Finance · Tech Intelligence" readOnly className={inputCls + ' opacity-60 cursor-not-allowed'} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Site URL</label>
          <input defaultValue={process.env.NEXT_PUBLIC_URL || 'https://techpulseglobe.com'} readOnly className={inputCls + ' opacity-60 cursor-not-allowed font-mono text-xs'} />
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">Site settings are managed in <code className="text-blue-300 font-mono">src/config/site.ts</code> and environment variables.</p>
        </div>
      </Section>

      {/* Environment Variables */}
      <Section icon={Database} title="Environment" description="Configuration status — values are read-only for security">
        <div className="space-y-3">
          {envVars.map(v => (
            <EnvRow key={v.envKey} {...v} />
          ))}
        </div>
      </Section>

      {/* Admin Security */}
      <Section icon={Shield} title="Admin Security" description="Authentication settings">
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Admin Email</label>
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
              <span className="text-sm text-slate-400 font-mono flex-1">
                {process.env.NEXT_PUBLIC_ADMIN_EMAIL_HINT || 'admin@techpulseglobe.com'}
              </span>
              <span className="text-xs text-slate-600">Set via ADMIN_EMAIL env var</span>
            </div>
          </div>
          <div>
            <label className={labelCls}>Session Duration</label>
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
              <span className="text-sm text-slate-400 flex-1">30 days</span>
              <span className="text-xs text-slate-600">JWT strategy</span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <Key className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              To change admin credentials, update <code className="text-yellow-300 font-mono">ADMIN_EMAIL</code> and <code className="text-yellow-300 font-mono">ADMIN_PASSWORD</code> in your <code className="text-yellow-300 font-mono">.env.local</code> file and restart the server.
            </p>
          </div>
        </div>
      </Section>

      {/* Search */}
      <Section icon={Search} title="Search" description="Built-in MongoDB search — no external service needed">
        <div className="space-y-2">
          {[
            { label: 'Search engine',     value: 'MongoDB regex search',  ok: true },
            { label: 'Sync required',     value: 'Never — always live',   ok: true },
            { label: 'External service',  value: 'None',                  ok: true },
            { label: 'Searches',          value: 'Title · Excerpt · Tags', ok: true },
            { label: 'Trending searches', value: 'Auto from top articles', ok: true },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
              <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-green-500/15">
                <Check className="w-2.5 h-2.5 text-green-400" />
              </span>
              <span className="text-sm text-slate-400 flex-1">{item.label}</span>
              <span className="text-xs text-slate-500">{item.value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Google Discover */}
      <Section icon={Bell} title="Google Discover Requirements" description="SEO and content standards enforced by the CMS">
        <div className="space-y-2">
          {[
            { label: 'Minimum image width',     value: '1200px',             ok: true },
            { label: 'Minimum image height',    value: '630px',              ok: true },
            { label: 'Auto WebP conversion',    value: 'Enabled',            ok: true },
            { label: 'Auto reading time',       value: 'Calculated on save', ok: true },
            { label: 'publishedAt timestamp',   value: 'Auto-set on publish', ok: true },
            { label: 'Canonical URLs',          value: 'Via next metadata',  ok: true },
            { label: 'Sitemap generation',      value: 'app/sitemap.ts',     ok: true },
            { label: 'robots.txt',              value: 'app/robots.ts',      ok: true },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                item.ok ? 'bg-green-500/15' : 'bg-red-500/15'
              }`}>
                <Check className={`w-2.5 h-2.5 ${item.ok ? 'text-green-400' : 'text-red-400'}`} />
              </span>
              <span className="text-sm text-slate-400 flex-1">{item.label}</span>
              <span className="text-xs text-slate-500">{item.value}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

