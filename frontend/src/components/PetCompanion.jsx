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
  mimi: { speed: 0.04, pauseChance: 0.008, idleSleepMs: 12000, hops: false },
  jeebie: { speed: 0.08, pauseChance: 0.004, idleSleepMs: null, hops: false },
  toffee: { speed: 0.03, pauseChance: 0.014, idleSleepMs: null, hops: false, edgePreference: true },
  biscuit: { speed: 0.10, pauseChance: 0.002, idleSleepMs: null, hops: false },
}

export default function PetCompanion() {
  const { petType, petName } = usePet()
  const [pos, setPos] = useState({ x: 12, y: 84 })
  const [facingLeft, setFacingLeft] = useState(false)
  const [petState, setPetState] = useState('idle')
  const [showTooltip, setShowTooltip] = useState(false)
  const [scrolling, setScrolling] = useState(false)

  const targetRef = useRef({ x: 12, y: 84 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const lastInteractionRef = useRef(Date.now())
  const tooltipTimerRef = useRef(null)
  const scrollTimerRef = useRef(null)

  const PetComponent = PET_COMPONENTS[petType] || MimiPet
  const behaviour = PET_BEHAVIOURS[petType] || PET_BEHAVIOURS.mimi

  // Movement loop
  useEffect(() => {
    let raf
    let lastTargetUpdate = 0

    const loop = (timestamp) => {
      // Pick a new target periodically
      if (timestamp - lastTargetUpdate > 3000 && Math.random() > behaviour.pauseChance * 100) {
        if (behaviour.edgePreference) {
          // Toffee stays near edges
          targetRef.current.x = Math.random() > 0.5 ? 6 + Math.random() * 12 : 80 + Math.random() * 12
        } else {
          targetRef.current.x = 8 + Math.random() * 84
        }
        targetRef.current.y = 82 + Math.random() * 6
        lastTargetUpdate = timestamp
      }

      // Spring physics — smooth, no jumps
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
      if (inactiveTime > behaviour.idleSleepMs && petState !== 'sleep') {
        setPetState('sleep')
      }
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

  // Scroll-based opacity dim
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

  const handleMouseEnter = () => {
    tooltipTimerRef.current = setTimeout(() => setShowTooltip(true), 500)
  }
  const handleMouseLeave = () => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    setShowTooltip(false)
  }

  return (
    <div
      className={`pet-container ${scrolling ? 'scrolling' : ''}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        opacity: scrolling ? 0.3 : 0.9,
        transform: `translateX(-50%) translateY(-50%) scaleX(${facingLeft ? -1 : 1})`,
        transition: 'transform 300ms ease, opacity 300ms ease',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tooltip */}
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
      <PetComponent state={petState} size={48} />
    </div>
  )
}
