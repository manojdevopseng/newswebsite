import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'TechPulseGlobe — AI, Finance & Tech Intelligence'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #111128 50%, #0a0a0f 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Logo / Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(96,165,250,0.2)',
              border: '2px solid #60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#60a5fa',
              }}
            />
          </div>
          <span style={{ fontSize: '42px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-1px' }}>
            TechPulse<span style={{ color: '#60a5fa' }}>Globe</span>
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '22px',
            color: '#94a3b8',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '48px',
          }}
        >
          AI · Finance · Tech Intelligence
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {['🤖 AI News', '📈 Finance', '💻 Technology', '🚀 Startups'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '8px 20px',
                borderRadius: '999px',
                background: 'rgba(96,165,250,0.1)',
                border: '1px solid rgba(96,165,250,0.3)',
                color: '#93c5fd',
                fontSize: '16px',
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            color: 'rgba(148,163,184,0.5)',
            fontSize: '16px',
          }}
        >
          techpulseglobe.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
