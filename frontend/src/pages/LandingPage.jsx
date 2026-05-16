import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [introPhase, setIntroPhase] = useState(() =>
    sessionStorage.getItem('criterionIntroSeen') ? 'done' : 'draw'
  )

  useEffect(() => {
    if (introPhase === 'draw') {
      const t = setTimeout(() => setIntroPhase('recede'), 1400)
      return () => clearTimeout(t)
    }
    if (introPhase === 'recede') {
      const t = setTimeout(() => setIntroPhase('reveal'), 850)
      return () => clearTimeout(t)
    }
    if (introPhase === 'reveal') {
      const t = setTimeout(() => {
        sessionStorage.setItem('criterionIntroSeen', '1')
        setIntroPhase('done')
      }, 400)
      return () => clearTimeout(t)
    }
  }, [introPhase])

  const skipIntro = () => {
    sessionStorage.setItem('criterionIntroSeen', '1')
    setIntroPhase('done')
  }

  const handleEnter = () => navigate('/login')
  const handleBrowse = () => {
    if (sessionStorage.getItem('guestModalDismissed')) {
      navigate('/discover?guest=1')
    } else {
      setShowGuestModal(true)
    }
  }

  const continueAsGuest = () => {
    sessionStorage.setItem('guestModalDismissed', '1')
    setShowGuestModal(false)
    navigate('/discover?guest=1')
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col">

      {/* ── Animated background ───────────────────────────────────────────── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#0a0a0a' }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%',
          transform: 'translateX(-50%) translateZ(0)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(255,75,137,0.1) 0%, transparent 70%)',
          animation: 'orbBreath 6s ease-in-out infinite',
          willChange: 'transform, opacity',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '-10%',
          transform: 'translateZ(0)',
          width: 400, height: 400,
          background: 'radial-gradient(ellipse, rgba(0,219,233,0.06) 0%, transparent 70%)',
          animation: 'orbBreathRight 8s ease-in-out infinite',
          willChange: 'transform, opacity',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
          background: 'linear-gradient(to top, #0a0a0a, transparent)',
        }} />
      </div>

      {/* ── Full page dot grid ────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        <PageDotGrid />
      </div>

      {/* ── Intro: Phase 1 — C draw ───────────────────────────────────────── */}
      {introPhase === 'draw' && (
        <div
          key="intro-draw"
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <svg
              viewBox="0 0 200 200"
              style={{ width: 'clamp(130px, 22vw, 200px)', height: 'clamp(130px, 22vw, 200px)', overflow: 'visible' }}
            >
              <path
                d="M 155 55 A 75 75 0 1 0 155 145"
                fill="none"
                stroke="#ff4b89"
                strokeWidth="16"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 382,
                  strokeDashoffset: 382,
                  animation: 'cDraw 1100ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
                  filter: 'drop-shadow(0 0 10px #ff4b89) drop-shadow(0 0 28px rgba(255,75,137,0.5))',
                }}
              />
              <path
                d="M 155 55 A 75 75 0 1 0 155 145"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="3"
                strokeLinecap="round"
                style={{
                  strokeDasharray: '28 354',
                  strokeDashoffset: 382,
                  animation: 'cSweep 1100ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
                }}
              />
            </svg>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(10px, 1.8vw, 15px)',
              letterSpacing: '0.55em',
              color: 'transparent',
              animation: 'ctTextFade 500ms ease-out 750ms forwards',
            }}>
              CRITERION
            </div>
          </div>
        </div>
      )}

      {/* ── Intro: Phase 2 — recede (rush through) ───────────────────────── */}
      {introPhase === 'recede' && (
        <div
          key="intro-recede"
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,75,137,0.25) 0%, transparent 70%)',
            animation: 'flashFade 850ms ease-out forwards',
            pointerEvents: 'none',
          }} />
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
            animation: 'rushThrough 850ms cubic-bezier(0.2, 0, 0.8, 1) forwards',
          }}>
            <svg
              viewBox="0 0 200 200"
              style={{ width: 'clamp(130px, 22vw, 200px)', height: 'clamp(130px, 22vw, 200px)', overflow: 'visible' }}
            >
              <path
                d="M 155 55 A 75 75 0 1 0 155 145"
                fill="none"
                stroke="#ff4b89"
                strokeWidth="16"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 16px #ff4b89) drop-shadow(0 0 40px rgba(255,75,137,0.7))' }}
              />
            </svg>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(10px, 1.8vw, 15px)',
              letterSpacing: '0.55em',
              color: 'rgba(255,255,255,0.85)',
            }}>
              CRITERION
            </div>
          </div>
        </div>
      )}

      {/* ── Intro: Phase 3 — reveal ───────────────────────────────────────── */}
      {introPhase === 'reveal' && (
        <div
          key="intro-reveal"
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: '#000',
            animation: 'fadeOut 450ms ease-in forwards',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── Skip button ───────────────────────────────────────────────────── */}
      {(introPhase === 'draw' || introPhase === 'recede') && (
        <button
          onClick={skipIntro}
          style={{
            position: 'fixed', top: 20, right: 20, zIndex: 101,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'Space Grotesk, sans-serif',
            transition: 'color 200ms',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
        >
          Skip
        </button>
      )}

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <header style={{ position: 'relative', zIndex: 10, padding: '12px 16px', display: 'flex', justifyContent: 'center' }}>
        <span className="brand-wordmark text-xl">CRITERION</span>
      </header>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 96, background: 'transparent' }}>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div style={{
          paddingTop: 80, paddingBottom: 64,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', position: 'relative',
          width: '100%', paddingLeft: 24, paddingRight: 24,
        }}>
          <div style={{
            position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 280,
            background: 'radial-gradient(ellipse, rgba(255,75,137,0.2) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900,
            fontSize: 'clamp(56px, 14vw, 120px)',
            letterSpacing: '0.18em', color: '#ffffff',
            textShadow: '0 0 80px rgba(255,255,255,0.2), 0 0 160px rgba(255,75,137,0.12)',
            lineHeight: 1, margin: 0, position: 'relative', zIndex: 1,
            opacity: 0,
            animation: introPhase === 'done' ? 'fadeInUp 800ms ease-out 100ms forwards' : 'none',
          }}>
            CRITERION
          </h1>

          <p style={{
            fontFamily: 'Space Grotesk, sans-serif', fontStyle: 'italic',
            fontSize: 18, color: '#00dbe9', marginTop: 16, letterSpacing: '0.08em',
            position: 'relative', zIndex: 1, opacity: 0,
            animation: introPhase === 'done' ? 'fadeInUp 800ms ease-out 250ms forwards' : 'none',
          }}>
            your taste, refined
          </p>

          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: 10, marginTop: 36, position: 'relative', zIndex: 1, opacity: 0,
            animation: introPhase === 'done' ? 'fadeInUp 800ms ease-out 380ms forwards' : 'none',
          }}>
            <FeaturePill dotColor="#00dbe9" label="AI RECOMMENDATIONS" />
            <FeaturePill dotColor="#ff4b89" label="LIVE COMMUNITIES" />
            <FeaturePill dotColor="#ffffff" label="10,000+ FILMS" />
          </div>

          <div style={{
            marginTop: 44, width: '100%', maxWidth: 360,
            display: 'flex', flexDirection: 'column', gap: 12,
            position: 'relative', zIndex: 1, opacity: 0,
            animation: introPhase === 'done' ? 'fadeInUp 800ms ease-out 500ms forwards' : 'none',
          }}>
            <button onClick={handleEnter} className="btn-primary w-full" style={{ fontSize: 15, letterSpacing: '0.1em', boxShadow: '0 0 32px rgba(255,75,137,0.45)' }}>
              ENTER CRITERION
            </button>
            <button onClick={handleBrowse} className="btn-secondary w-full" style={{ fontSize: 15, letterSpacing: '0.1em' }}>
              BROWSE REVIEWS
            </button>
          </div>
        </div>

        {/* ── Divider: How It Works ────────────────────────────────────────── */}
        <SectionDivider label="HOW IT WORKS" color="#ff4b89" />

        {/* ── How It Works ────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 900, margin: '0 auto 64px', padding: '0 24px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff4b89" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/><path d="M11 8v6M8 11h6" strokeWidth="1.5"/>
                  </svg>
                ),
                title: 'Discover',
                body: "Our AI maps your cinematic palette and surfaces films precisely matched to your taste — not just what's trending globally.",
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff4b89" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ),
                title: 'Review',
                body: 'Log every viewing. Write detailed critiques, assign nuanced ratings, and build a personal film diary that evolves with you.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff4b89" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                ),
                title: 'Connect',
                body: 'Join curated genre clubs, engage in theory debates, and share recommendations with a community that treats cinema as art.',
              },
            ].map((s, index) => (
              <div
                key={s.title}
                className="glass"
                style={{
                  borderRadius: 20, padding: 28,
                  border: '1px solid rgba(255,75,137,0.12)',
                  transition: 'box-shadow 200ms ease, border-color 200ms ease',
                  cursor: 'default', position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(255,75,137,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(255,75,137,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'rgba(255,75,137,0.12)'
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: 60, height: 60,
                  background: 'radial-gradient(ellipse at top left, rgba(255,75,137,0.12) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(255,75,137,0.08)',
                    border: '1px solid rgba(255,75,137,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {s.icon}
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 700, color: 'rgba(255,75,137,0.35)', letterSpacing: '0.2em' }}>
                    0{index + 1}
                  </div>
                </div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 17, color: '#fff', marginBottom: 10, letterSpacing: '0.02em' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 13, color: '#7a7a7a', lineHeight: 1.7 }}>{s.body}</div>
                <div style={{
                  marginTop: 24, height: 1,
                  background: `linear-gradient(90deg, rgba(255,75,137,0.5) ${(index + 1) * 33}%, rgba(255,255,255,0.06) 0%)`,
                }} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider: By The Numbers ──────────────────────────────────────── */}
        <SectionDivider label="BY THE NUMBERS" color="#00dbe9" />

        {/* ── Stats bar ───────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 900, margin: '0 auto 64px', padding: '0 24px', width: '100%' }}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
            <div className="glass" style={{
              borderRadius: 16, padding: '24px 32px',
              display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
              alignItems: 'center', gap: 0,
            }}>
              {[
                { num: '10,000+', label: 'Films catalogued' },
                null,
                { num: 'AI-Powered', label: 'Daily recommendations' },
                null,
                { num: 'Live', label: 'Community discussions' },
              ].map((s, i) =>
                s === null
                  ? <div key={i} style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />
                  : <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 24, color: '#ff4b89', marginBottom: 4 }}>{s.num}</div>
                      <div style={{ fontSize: 12, color: '#9a9a9a', letterSpacing: '0.05em' }}>{s.label}</div>
                    </div>
              )}
            </div>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 16,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'statsShimmer 3s linear infinite',
              pointerEvents: 'none',
            }} />
          </div>
        </div>

        {/* ── Divider: What People Say ─────────────────────────────────────── */}
        <SectionDivider label="WHAT PEOPLE SAY" color="#e5bcc4" />

        {/* ── Quotes ──────────────────────────────────────────────────────── */}
        <div style={{
          maxWidth: 900, margin: '0 auto 64px', padding: '0 24px', width: '100%',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16,
        }}>
          {[
            { quote: "Finally an app that actually gets my taste. The AI recommendations are scary accurate.", handle: '@cinephile_kai', initials: 'CK', color: '#ff4b89' },
            { quote: "The communities here debate film like nowhere else. Horror club is unhinged in the best way.", handle: '@void_walker', initials: 'VW', color: '#00dbe9' },
          ].map((q) => (
            <div key={q.handle} className="glass" style={{ borderRadius: 20, padding: 24, borderLeft: '3px solid #ff4b89' }}>
              <p style={{ fontSize: 14, color: '#e2e2e2', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>
                "{q.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `linear-gradient(135deg,${q.color},#0a0a0a)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}>{q.initials}</div>
                <span style={{ fontSize: 12, color: '#ff4b89', fontWeight: 600 }}>{q.handle}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Final CTA strip ─────────────────────────────────────────────── */}
        <div style={{
          width: '100vw', marginLeft: 'calc(-50vw + 50%)',
          padding: '48px 24px',
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          textAlign: 'center',
        }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '0.02em' }}>
            Your next favourite film is one recommendation away
          </h3>
          <p style={{ color: '#9a9a9a', fontSize: 14, marginBottom: 28 }}>
            Join free. No algorithm fatigue. Just cinema.
          </p>
          <button onClick={handleEnter} className="btn-primary" style={{ padding: '16px 48px', fontSize: 15 }}>
            Start Watching
          </button>
        </div>
      </main>

      {/* ── Guest modal ───────────────────────────────────────────────────── */}
      {showGuestModal && (
        <GuestModeModal
          onContinue={continueAsGuest}
          onSignup={() => navigate('/signup')}
          onClose={() => setShowGuestModal(false)}
        />
      )}
    </div>
  )
}

// ── Section divider ───────────────────────────────────────────────────────────
function SectionDivider({ label, color }) {
  return (
    <div style={{
      width: '100%', maxWidth: 900, margin: '0 auto 48px',
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px',
    }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${color}4d)` }} />
      <span style={{ color, fontSize: 10, letterSpacing: '0.2em', fontFamily: 'Space Grotesk', fontWeight: 700 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}4d, transparent)` }} />
    </div>
  )
}

// ── Full-page Dot Grid (canvas) ───────────────────────────────────────────────
function PageDotGrid() {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const COLS = window.innerWidth < 768 ? 20 : 38
    const ROWS = window.innerWidth < 768 ? 28 : 34
    const RADIUS = 120

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    const dots = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        dots.push({
          nx: col / (COLS - 1),
          ny: row / (ROWS - 1),
          baseAlpha: 0.06 + Math.random() * 0.06,
        })
      }
    }

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      const { x: mx, y: my } = mouseRef.current

      ctx.clearRect(0, 0, W, H)

      dots.forEach((dot) => {
        const dx = dot.nx * W
        const dy = dot.ny * H
        const dist = Math.sqrt((dx - mx) ** 2 + (dy - my) ** 2)

        if (dist < RADIUS) {
          const s = 1 - dist / RADIUS
          const radius = 1.5 + s * 5
          const glowRadius = radius * 3
          const glowAlpha = s * 0.5

          const grd = ctx.createRadialGradient(dx, dy, 0, dx, dy, glowRadius)
          grd.addColorStop(0, `rgba(255, 75, 137, ${glowAlpha})`)
          grd.addColorStop(1, 'rgba(255, 75, 137, 0)')
          ctx.beginPath()
          ctx.arc(dx, dy, glowRadius, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()

          ctx.beginPath()
          ctx.arc(dx, dy, radius, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 75, 137, 1)'
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(dx, dy, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${dot.baseAlpha})`
          ctx.fill()
        }
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        maskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, black 30%, rgba(0,0,0,0.5) 60%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, black 30%, rgba(0,0,0,0.5) 60%, transparent 100%)',
      }}
    />
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function FeaturePill({ dotColor, label }) {
  return (
    <div className="px-4 py-2 rounded-full flex items-center gap-2 glass" style={{ fontSize: 11 }}>
      <span className="w-2 h-2 rounded-full" style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
      <span className="text-text-primary tracking-widest font-semibold">{label}</span>
    </div>
  )
}

function GuestModeModal({ onContinue, onSignup, onClose }) {
  return (
    <div
      className="z-modal fixed inset-0 flex items-center justify-center p-6 animate-fade-in"
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-sm rounded-3xl p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255, 75, 137, 0.15)', border: '1px solid rgba(255, 75, 137, 0.4)' }}
        >
          <span className="text-2xl">⚠</span>
        </div>
        <h2 className="text-xl font-bold text-center mb-2" style={{ fontFamily: 'Space Grotesk', color: '#ffffff' }}>
          You're in Guest Mode
        </h2>
        <p className="text-center text-text-secondary text-sm mb-4">
          Browse films and read reviews freely. Sign up to unlock:
        </p>
        <ul className="space-y-2 mb-6">
          {['Communities & discussions', 'Real-time chat rooms', 'AI-powered recommendations', 'Personal watchlist', 'Daily streak & rewards'].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-text-primary">
              <span className="text-pink-neon">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <button onClick={onSignup} className="btn-primary w-full text-sm">Create Account</button>
          <button onClick={onContinue} className="text-text-secondary text-sm py-2 hover:text-text-primary transition">
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  )
}
