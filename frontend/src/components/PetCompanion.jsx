import { useEffect, useRef, useState } from 'react'
import { usePet } from '../context/PetContext'
import MimiPet from './pets/MimiPet'
import JeebiePet from './pets/JeebiePet'
import ToffeePet from './pets/ToffeePet'
import BiscuitPet from './pets/BiscuitPet'

const PET_COMPONENTS = {
  mimi: MimiPet,
  jeebie: JeebiePet,
  toffee: ToffeePet,
  biscuit: BiscuitPet,
}

const PET_BEHAVIOURS = {
  mimi:    { speed: 0.04, pauseChance: 0.008, idleSleepMs: 12000 },
  jeebie:  { speed: 0.08, pauseChance: 0.004, idleSleepMs: null },
  toffee:  { speed: 0.03, pauseChance: 0.014, idleSleepMs: null, edgePreference: true },
  biscuit: { speed: 0.10, pauseChance: 0.002, idleSleepMs: null },
}

// Per-pet random 3D motions mimicking personality
const PET_MOTIONS = {
  biscuit: [
    { anim: 'petBounce',  duration: 900 },
    { anim: 'petZoomies', duration: 1400 },
    { anim: 'petWiggle',  duration: 700 },
    { anim: 'petBounce',  duration: 700 },
  ],
  jeebie: [
    { anim: 'petDart',   duration: 500 },
    { anim: 'petPounce', duration: 900 },
    { anim: 'petWiggle', duration: 500 },
    { anim: 'petDart',   duration: 400 },
  ],
  toffee: [
    { anim: 'petGroom',   duration: 2000 },
    { anim: 'petTilt',    duration: 1800 },
    { anim: 'petStretch', duration: 1600 },
  ],
  mimi: [
    { anim: 'petSway', duration: 2800 },
    { anim: 'petTilt', duration: 2000 },
    { anim: 'petSway', duration: 3200 },
  ],
}

const PET_ANIM_CSS = `
  @keyframes petBounce {
    0%,100% { transform: translateY(0)    rotateX(0deg); }
    20%     { transform: translateY(-14px) rotateX(-12deg); }
    40%     { transform: translateY(0)    rotateX(6deg); }
    60%     { transform: translateY(-7px)  rotateX(-6deg); }
    80%     { transform: translateY(0)    rotateX(2deg); }
  }
  @keyframes petZoomies {
    0%,100% { transform: rotateY(0deg)   rotateZ(0deg)   translateY(0); }
    12%     { transform: rotateY(-30deg) rotateZ(-10deg) translateY(-5px); }
    25%     { transform: rotateY(30deg)  rotateZ(10deg)  translateY(-5px); }
    38%     { transform: rotateY(-25deg) rotateZ(-7deg)  translateY(-3px); }
    50%     { transform: rotateY(25deg)  rotateZ(7deg)   translateY(-3px); }
    65%     { transform: rotateY(-15deg) rotateZ(-4deg)  translateY(-1px); }
    80%     { transform: rotateY(10deg)  rotateZ(3deg); }
  }
  @keyframes petWiggle {
    0%,100% { transform: rotateZ(0deg); }
    20%     { transform: rotateZ(-14deg); }
    40%     { transform: rotateZ(14deg); }
    60%     { transform: rotateZ(-9deg); }
    80%     { transform: rotateZ(9deg); }
  }
  @keyframes petDart {
    0%,100% { transform: rotateY(0deg)   scaleX(1); }
    25%     { transform: rotateY(-35deg) scaleX(1.12); }
    55%     { transform: rotateY(22deg)  scaleX(0.95); }
    75%     { transform: rotateY(-10deg) scaleX(1.05); }
  }
  @keyframes petPounce {
    0%,100% { transform: translateY(0)    rotateX(0deg)   scaleY(1); }
    20%     { transform: translateY(5px)  rotateX(18deg)  scaleY(0.88); }
    45%     { transform: translateY(-16px) rotateX(-16deg) scaleY(1.1); }
    65%     { transform: translateY(-4px) rotateX(-6deg)  scaleY(1.02); }
    82%     { transform: translateY(2px)  rotateX(4deg)   scaleY(0.96); }
  }
  @keyframes petGroom {
    0%,100% { transform: rotateX(0deg)  rotateZ(0deg); }
    25%     { transform: rotateX(28deg) rotateZ(-3deg); }
    55%     { transform: rotateX(22deg) rotateZ(2deg); }
    78%     { transform: rotateX(6deg)  rotateZ(0deg); }
  }
  @keyframes petTilt {
    0%,100% { transform: rotateZ(0deg); }
    25%     { transform: rotateZ(18deg); }
    55%     { transform: rotateZ(18deg); }
    80%     { transform: rotateZ(4deg); }
  }
  @keyframes petStretch {
    0%,100% { transform: scaleY(1)    rotateX(0deg); }
    25%     { transform: scaleY(1.12) rotateX(-12deg); }
    55%     { transform: scaleY(1.08) rotateX(-8deg); }
    80%     { transform: scaleY(0.96) rotateX(4deg); }
  }
  @keyframes petSway {
    0%,100% { transform: rotateZ(0deg)   translateX(0); }
    25%     { transform: rotateZ(10deg)  translateX(4px); }
    75%     { transform: rotateZ(-10deg) translateX(-4px); }
  }
`

export default function PetCompanion() {
  const { petType, petName } = usePet()
  const [pos, setPos] = useState({ x: 12, y: 84 })
  const [facingLeft, setFacingLeft] = useState(false)
  const [petState, setPetState] = useState('idle')
  const [showTooltip, setShowTooltip] = useState(false)
  const [scrolling, setScrolling] = useState(false)
  const [motionAnim, setMotionAnim] = useState(null)
  const [motionDuration, setMotionDuration] = useState(1000)

  const targetRef = useRef({ x: 12, y: 84 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const lastInteractionRef = useRef(Date.now())
  const tooltipTimerRef = useRef(null)
  const scrollTimerRef = useRef(null)
  const motionTimerRef = useRef(null)

  const PetComponent = PET_COMPONENTS[petType] || MimiPet
  const behaviour = PET_BEHAVIOURS[petType] || PET_BEHAVIOURS.mimi

  // Movement loop
  useEffect(() => {
    let raf
    let lastTargetUpdate = 0

    const loop = (timestamp) => {
      if (timestamp - lastTargetUpdate > 3000 && Math.random() > behaviour.pauseChance * 100) {
        if (behaviour.edgePreference) {
          targetRef.current.x = Math.random() > 0.5 ? 6 + Math.random() * 12 : 80 + Math.random() * 12
        } else {
          targetRef.current.x = 8 + Math.random() * 84
        }
        targetRef.current.y = 82 + Math.random() * 6
        lastTargetUpdate = timestamp
      }

      setPos((prev) => {
        const dx = targetRef.current.x - prev.x
        const dy = targetRef.current.y - prev.y
        velocityRef.current.x = velocityRef.current.x * 0.85 + dx * (behaviour.speed * 0.5)
        velocityRef.current.y = velocityRef.current.y * 0.85 + dy * (behaviour.speed * 0.5)
        const newX = Math.max(4, Math.min(94, prev.x + velocityRef.current.x))
        const newY = Math.max(80, Math.min(91, prev.y + velocityRef.current.y))

        if (Math.abs(velocityRef.current.x) > 0.05) {
          setFacingLeft((curr) => {
            const wantLeft = velocityRef.current.x < 0
            return wantLeft !== curr ? wantLeft : curr
          })
        }

        return { x: newX, y: newY }
      })

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [petType, behaviour])

  // Sleep state for Mimi
  useEffect(() => {
    if (petType !== 'mimi') {
      setPetState('idle')
      return
    }
    const checkSleep = () => {
      const inactiveTime = Date.now() - lastInteractionRef.current
      if (inactiveTime > behaviour.idleSleepMs && petState !== 'sleep') setPetState('sleep')
    }
    const interval = setInterval(checkSleep, 1000)
    const wake = () => {
      lastInteractionRef.current = Date.now()
      if (petState === 'sleep') setPetState('idle')
    }
    window.addEventListener('mousemove', wake)
    window.addEventListener('keydown', wake)
    window.addEventListener('click', wake)
    window.addEventListener('scroll', wake)
    return () => {
      clearInterval(interval)
      window.removeEventListener('mousemove', wake)
      window.removeEventListener('keydown', wake)
      window.removeEventListener('click', wake)
      window.removeEventListener('scroll', wake)
    }
  }, [petType, petState, behaviour.idleSleepMs])

  // Scroll opacity dim
  useEffect(() => {
    const handleScroll = () => {
      setScrolling(true)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = setTimeout(() => setScrolling(false), 1500)
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
    }
  }, [])

  // Personality motion machine — fires random 3D animations every 4-13s
  useEffect(() => {
    const motions = PET_MOTIONS[petType] || []
    if (!motions.length) return

    const schedule = () => {
      const delay = 4000 + Math.random() * 9000
      motionTimerRef.current = setTimeout(() => {
        const pick = motions[Math.floor(Math.random() * motions.length)]
        setMotionAnim(pick.anim)
        setMotionDuration(pick.duration)
        motionTimerRef.current = setTimeout(() => {
          setMotionAnim(null)
          schedule()
        }, pick.duration + 150)
      }, delay)
    }

    schedule()
    return () => clearTimeout(motionTimerRef.current)
  }, [petType])

  const handleMouseEnter = () => {
    tooltipTimerRef.current = setTimeout(() => setShowTooltip(true), 500)
  }
  const handleMouseLeave = () => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    setShowTooltip(false)
  }

  return (
    <>
      <style>{PET_ANIM_CSS}</style>
      <div
        className="pet-container"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          opacity: scrolling ? 0.3 : 0.9,
          transition: 'opacity 300ms ease',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Facing + centering layer */}
        <div
          style={{
            transform: `translateX(-50%) translateY(-50%) scaleX(${facingLeft ? -1 : 1})`,
            transition: 'transform 300ms ease',
            display: 'inline-block',
          }}
        >
          {/* Tooltip (counter-flipped so text always reads correctly) */}
          {showTooltip && (
            <div
              style={{
                position: 'absolute',
                bottom: '110%',
                left: '50%',
                transform: `translateX(-50%) scaleX(${facingLeft ? -1 : 1})`,
                background: 'rgba(20, 20, 20, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 75, 137, 0.3)',
                borderRadius: '9999px',
                padding: '4px 12px',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                color: '#e2e2e2',
                pointerEvents: 'none',
                animation: 'fadeIn 200ms ease',
              }}
            >
              <span style={{ color: '#ff4b89' }}>♥</span>{' '}
              {petName || 'tap me'}
            </div>
          )}

          {/* 3D animation layer */}
          <div
            style={{
              display: 'inline-block',
              perspective: '220px',
              ...(motionAnim
                ? { animation: `${motionAnim} ${motionDuration}ms ease-in-out both` }
                : {}),
            }}
          >
            <PetComponent state={petState} size={48} />
          </div>
        </div>
      </div>
    </>
  )
}
