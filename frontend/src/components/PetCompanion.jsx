import { useEffect, useRef, useState, useCallback } from 'react'
import { usePet } from '../context/PetContext'
import MimiPet from './pets/MimiPet'
import JeebiePet from './pets/JeebiePet'
import ToffeePet from './pets/ToffeePet'
import BiscuitPet from './pets/BiscuitPet'
import MochiPet from './pets/MochiPet'
import PuddingPet from './pets/PuddingPet'
import PepperPet from './pets/PepperPet'
import CocoPet from './pets/CocoPet'

const PET_COMPONENTS = {
  mimi: MimiPet,
  jeebie: JeebiePet,
  toffee: ToffeePet,
  biscuit: BiscuitPet,
  mochi: MochiPet,
  pudding: PuddingPet,
  pepper: PepperPet,
  coco: CocoPet,
}

// Safe zones: bottom strip and side corridors
// x: 0–8% (left) or 92–100% (right); y: 82–91%
// Returns a random target in a safe zone
function randomSafeTarget(petType, prevX) {
  const zone = Math.random()
  let x, y

  if (petType === 'toffee') {
    // Prefers edges
    x = Math.random() > 0.5 ? 4 + Math.random() * 6 : 90 + Math.random() * 6
    y = 83 + Math.random() * 7
  } else if (zone < 0.15) {
    // Left corridor
    x = 1 + Math.random() * 7
    y = 83 + Math.random() * 7
  } else if (zone < 0.3) {
    // Right corridor
    x = 92 + Math.random() * 6
    y = 83 + Math.random() * 7
  } else {
    // Bottom strip
    x = 8 + Math.random() * 84
    y = 83 + Math.random() * 7
  }

  return { x: Math.max(1, Math.min(97, x)), y: Math.max(82, Math.min(91, y)) }
}

// Per-pet speed (px per viewport-% per frame)
const PET_SPEED = {
  mimi:    { base: 0.35, variance: 0.25 },
  jeebie:  { base: 1.2,  variance: 0.8 },
  toffee:  { base: 0.5,  variance: 0.2 },
  biscuit: { base: 1.6,  variance: 0.9 },
  mochi:   { base: 0.0,  variance: 0.0 }, // hop-based, handled separately
  pudding: { base: 0.55, variance: 0.25 },
  pepper:  { base: 0.25, variance: 0.15 },
  coco:    { base: 0.6,  variance: 0.3 },
}

// Behaviour loop intervals
const PET_BEHAVIOUR_INTERVAL = {
  mimi:    [6000, 14000],
  jeebie:  [4000, 8000],
  toffee:  [8000, 16000],
  biscuit: [3000, 7000],
  mochi:   [500,  500],  // hop interval
  pudding: [3000, 8000],
  pepper:  [5000, 8000],
  coco:    [6000, 12000],
}

// Animation class name → CSS class (defined in index.css)
const ANIM_CLASSES = {
  mimiFloat:     'pet-anim-mimi-float',
  mimiSleep:     'pet-anim-mimi-sleep',
  jeebieVibrate: 'pet-anim-jeebie-vibrate',
  jeebieSpin:    'pet-anim-jeebie-spin',
  jeebiePounce:  'pet-anim-jeebie-pounce',
  toffeeTilt:    'pet-anim-toffee-tilt',
  biscuitBounce: 'pet-anim-biscuit-bounce',
  biscuitWiggle: 'pet-anim-biscuit-wiggle',
  mochiHop:      'pet-anim-mochi-hop',
  puddingJiggle: 'pet-anim-pudding-jiggle',
  puddingSpin:   'pet-anim-pudding-spin',
  pepperBlink:   'pet-anim-pepper-blink',
  cocoRock:      'pet-anim-coco-rock',
  cocoWave:      'pet-anim-coco-wave',
  peekOver:      'pet-anim-peek',
  petBreathe:    'pet-anim-breathe',
}

export default function PetCompanion() {
  const { petType, petName } = usePet()

  const [pos, setPos] = useState({ x: 12, y: 85 })
  const [facing, setFacing] = useState('right')
  const [petState, setPetState] = useState('idle')
  const [animClass, setAnimClass] = useState('pet-anim-breathe')
  const [showTooltip, setShowTooltip] = useState(false)
  const [scrolling, setScrolling] = useState(false)
  const [isPeeking, setIsPeeking] = useState(false)

  const posRef = useRef({ x: 12, y: 85 })
  const velRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 12, y: 85 })
  const facingRef = useRef('right')
  const petStateRef = useRef('idle')
  const isPeekingRef = useRef(false)
  const isFrozenRef = useRef(false) // for Mochi scroll-freeze
  const lastIdleRef = useRef(Date.now())

  const rafRef = useRef(null)
  const behaviourTimerRef = useRef(null)
  const peekTimerRef = useRef(null)
  const tooltipTimerRef = useRef(null)
  const scrollTimerRef = useRef(null)
  const animTimerRef = useRef(null)

  const PetComponent = PET_COMPONENTS[petType] || MimiPet

  // ── Movement loop (spring physics) ──────────────────────────────────────
  useEffect(() => {
    const isMochi = petType === 'mochi'
    let hopTimer = null
    let hopStep = 0

    const loop = () => {
      if (isFrozenRef.current) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      if (isMochi) {
        // Hop-based movement
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      const spd = PET_SPEED[petType] || PET_SPEED.mimi
      const speed = spd.base + Math.random() * 0.02 * spd.variance

      const dx = targetRef.current.x - posRef.current.x
      const dy = targetRef.current.y - posRef.current.y

      velRef.current.x = velRef.current.x * 0.82 + dx * 0.018 * speed * 3
      velRef.current.y = velRef.current.y * 0.82 + dy * 0.018 * speed * 3

      const newX = Math.max(1, Math.min(97, posRef.current.x + velRef.current.x))
      const newY = isPeekingRef.current
        ? posRef.current.y + velRef.current.y
        : Math.max(82, Math.min(91, posRef.current.y + velRef.current.y))

      posRef.current = { x: newX, y: newY }

      if (Math.abs(velRef.current.x) > 0.05) {
        const wantLeft = velRef.current.x < -0.05
        if (wantLeft !== (facingRef.current === 'left')) {
          facingRef.current = wantLeft ? 'left' : 'right'
          setFacing(facingRef.current)
        }
      }

      setPos({ x: newX, y: newY })
      rafRef.current = requestAnimationFrame(loop)
    }

    // Mochi hop loop
    const mochiHop = () => {
      if (isFrozenRef.current || isPeekingRef.current) {
        hopTimer = setTimeout(mochiHop, 500)
        return
      }

      const dx = targetRef.current.x - posRef.current.x
      const dy = targetRef.current.y - posRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > 0.5) {
        const step = Math.min(dist, 8 + Math.random() * 6)
        const nx = posRef.current.x + (dx / dist) * step
        const ny = Math.max(82, Math.min(91, posRef.current.y + (dy / dist) * step))
        posRef.current = { x: nx, y: ny }
        setPos({ x: nx, y: ny })

        const wantLeft = dx < 0
        if (wantLeft !== (facingRef.current === 'left')) {
          facingRef.current = wantLeft ? 'left' : 'right'
          setFacing(facingRef.current)
        }

        setAnimClass('pet-anim-mochi-hop')
        hopTimer = setTimeout(() => {
          setAnimClass('pet-anim-breathe')
          hopTimer = setTimeout(mochiHop, 100)
        }, 380)
      } else {
        hopTimer = setTimeout(mochiHop, 500)
      }
    }

    if (isMochi) {
      mochiHop()
    } else {
      rafRef.current = requestAnimationFrame(loop)
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (hopTimer) clearTimeout(hopTimer)
    }
  }, [petType])

  // ── Target update loop ────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPeekingRef.current) return
      const newTarget = randomSafeTarget(petType, posRef.current.x)
      targetRef.current = newTarget
    }, petType === 'biscuit' ? 2500 : petType === 'jeebie' ? 2000 : 4000 + Math.random() * 4000)

    return () => clearInterval(interval)
  }, [petType])

  // ── Personality behaviour loop ────────────────────────────────────────
  useEffect(() => {
    const [minMs, maxMs] = PET_BEHAVIOUR_INTERVAL[petType] || [6000, 12000]

    const schedule = () => {
      const delay = minMs + Math.random() * (maxMs - minMs)
      behaviourTimerRef.current = setTimeout(() => {
        runBehaviour()
        schedule()
      }, delay)
    }

    const runBehaviour = () => {
      if (isPeekingRef.current) return

      switch (petType) {
        case 'mimi': {
          const elapsed = Date.now() - lastIdleRef.current
          if (elapsed > 12000 && petStateRef.current !== 'sleep') {
            petStateRef.current = 'sleep'
            setPetState('sleep')
            setAnimClass('pet-anim-mimi-sleep')
          } else {
            const pick = Math.random()
            if (pick < 0.5) setAnimClass('pet-anim-mimi-float')
            else setAnimClass('pet-anim-toffee-tilt')
            clearAnimAfter(2800)
          }
          break
        }
        case 'jeebie': {
          const pick = Math.floor(Math.random() * 4)
          if (pick === 0) {
            // DART — velocity burst
            velRef.current.x = (Math.random() > 0.5 ? 1 : -1) * 4
            velRef.current.y = (Math.random() - 0.5) * 2
          } else if (pick === 1) {
            setAnimClass('pet-anim-jeebie-spin')
            clearAnimAfter(450)
          } else if (pick === 2) {
            setAnimClass('pet-anim-jeebie-pounce')
            clearAnimAfter(950)
          } else {
            setAnimClass('pet-anim-jeebie-vibrate')
            clearAnimAfter(550)
          }
          break
        }
        case 'toffee': {
          const pick = Math.floor(Math.random() * 3)
          if (pick === 0) {
            setAnimClass('pet-anim-toffee-tilt')
            clearAnimAfter(1800)
          } else if (pick === 1) {
            // Groom — slow scale bow
            setAnimClass('pet-anim-biscuit-wiggle')
            clearAnimAfter(1200)
          } else {
            setAnimClass('pet-anim-mimi-float')
            clearAnimAfter(2500)
          }
          break
        }
        case 'biscuit': {
          const pick = Math.floor(Math.random() * 4)
          if (pick === 0) {
            setAnimClass('pet-anim-biscuit-bounce')
            clearAnimAfter(900)
          } else if (pick === 1) {
            // ZOOMIES — speed burst
            velRef.current.x = (Math.random() > 0.5 ? 1 : -1) * 8
            targetRef.current = randomSafeTarget('biscuit', posRef.current.x)
          } else if (pick === 2) {
            setAnimClass('pet-anim-biscuit-wiggle')
            clearAnimAfter(700)
          } else {
            // SNIFF — bob
            setAnimClass('pet-anim-mochi-hop')
            clearAnimAfter(900)
          }
          break
        }
        case 'pudding': {
          const pick = Math.floor(Math.random() * 3)
          if (pick === 0) {
            setAnimClass('pet-anim-pudding-spin')
            clearAnimAfter(750)
          } else if (pick === 1) {
            setAnimClass('pet-anim-pudding-jiggle')
            clearAnimAfter(1200)
          } else {
            // Long pause — do nothing, already slow
          }
          break
        }
        case 'pepper': {
          setAnimClass('pet-anim-pepper-blink')
          clearAnimAfter(600)
          break
        }
        case 'coco': {
          // Gentle rock is always-on via CSS on body; wave on click
          setAnimClass('pet-anim-coco-rock')
          break
        }
        default:
          break
      }
    }

    schedule()
    return () => clearTimeout(behaviourTimerRef.current)
  }, [petType])

  const clearAnimAfter = useCallback((ms) => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current)
    animTimerRef.current = setTimeout(() => setAnimClass('pet-anim-breathe'), ms + 100)
  }, [])

  // ── Wake Mimi on interaction ──────────────────────────────────────────
  useEffect(() => {
    if (petType !== 'mimi') return
    const wake = () => {
      lastIdleRef.current = Date.now()
      if (petStateRef.current === 'sleep') {
        petStateRef.current = 'idle'
        setPetState('idle')
        setAnimClass('pet-anim-breathe')
      }
    }
    window.addEventListener('mousemove', wake, { passive: true })
    window.addEventListener('keydown', wake)
    window.addEventListener('click', wake)
    window.addEventListener('scroll', wake, { passive: true })
    return () => {
      window.removeEventListener('mousemove', wake)
      window.removeEventListener('keydown', wake)
      window.removeEventListener('click', wake)
      window.removeEventListener('scroll', wake)
    }
  }, [petType])

  // ── Biscuit + Coco — react to click position ─────────────────────────
  useEffect(() => {
    if (petType !== 'biscuit' && petType !== 'coco') return
    const handleClick = (e) => {
      if (isPeekingRef.current) return
      const xPct = (e.clientX / window.innerWidth) * 100
      if (petType === 'biscuit') {
        targetRef.current = { x: Math.max(1, Math.min(97, xPct)), y: 83 + Math.random() * 6 }
      }
      if (petType === 'coco') {
        setAnimClass('pet-anim-coco-wave')
        if (animTimerRef.current) clearTimeout(animTimerRef.current)
        animTimerRef.current = setTimeout(() => setAnimClass('pet-anim-coco-rock'), 700)
      }
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [petType])

  // ── Mochi scroll-freeze ───────────────────────────────────────────────
  useEffect(() => {
    if (petType !== 'mochi') return
    const onScroll = () => {
      isFrozenRef.current = true
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = setTimeout(() => {
        isFrozenRef.current = false
      }, 1500)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [petType])

  // ── Scroll opacity ────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolling(true)
      if (scrollTimerRef.current && petType !== 'mochi') clearTimeout(scrollTimerRef.current)
      const timer = setTimeout(() => setScrolling(false), 1500)
      if (petType !== 'mochi') scrollTimerRef.current = timer
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [petType])

  // ── Peek animation ────────────────────────────────────────────────────
  useEffect(() => {
    const schedulePeek = () => {
      const delay = 25000 + Math.random() * 20000
      peekTimerRef.current = setTimeout(() => {
        const cards = document.querySelectorAll('.peekable-card')
        if (!cards.length) {
          schedulePeek()
          return
        }
        const card = cards[Math.floor(Math.random() * cards.length)]
        const rect = card.getBoundingClientRect()

        // Only peek if card is in viewport
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          schedulePeek()
          return
        }

        const peekX = ((rect.right - 30) / window.innerWidth) * 100
        const peekY = ((rect.top - 20) / window.innerHeight) * 100

        // Cancel peek if card scrolls away
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting && isPeekingRef.current) {
              endPeek()
            }
          },
          { threshold: 0 }
        )
        observer.observe(card)

        isPeekingRef.current = true
        setIsPeeking(true)
        setPetState('peek')
        petStateRef.current = 'peek'

        targetRef.current = {
          x: Math.max(1, Math.min(97, peekX)),
          y: Math.max(5, Math.min(85, peekY)),
        }

        // Face inward toward card center
        const cardCenterX = ((rect.left + rect.width / 2) / window.innerWidth) * 100
        facingRef.current = posRef.current.x > cardCenterX ? 'left' : 'right'
        setFacing(facingRef.current)

        setAnimClass('pet-anim-peek')

        const endPeek = () => {
          observer.disconnect()
          isPeekingRef.current = false
          setIsPeeking(false)
          setPetState('idle')
          petStateRef.current = 'idle'
          setAnimClass('pet-anim-breathe')
          targetRef.current = randomSafeTarget(petType, posRef.current.x)
          schedulePeek()
        }

        peekTimerRef.current = setTimeout(endPeek, 3500)
      }, delay)
    }

    schedulePeek()
    return () => clearTimeout(peekTimerRef.current)
  }, [petType])

  // ── Tooltip ───────────────────────────────────────────────────────────
  const handleMouseEnter = () => {
    tooltipTimerRef.current = setTimeout(() => setShowTooltip(true), 600)
  }
  const handleMouseLeave = () => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    setShowTooltip(false)
  }

  const zIndex = petState === 'peek' ? 15 : 5

  return (
    <div
      className="pet-container"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        zIndex,
        opacity: scrolling ? 0.25 : 0.9,
        transition: scrolling ? 'opacity 200ms ease' : 'opacity 800ms ease',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          transform: `translateX(-50%) translateY(-50%) scaleX(${facing === 'left' ? -1 : 1})`,
          transition: 'transform 300ms ease',
          display: 'inline-block',
        }}
      >
        {/* Tooltip — counter-flip so text is always readable */}
        {showTooltip && (
          <div
            style={{
              position: 'absolute',
              bottom: '110%',
              left: '50%',
              transform: `translateX(-50%) scaleX(${facing === 'left' ? -1 : 1})`,
              background: 'rgba(20, 20, 20, 0.88)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 75, 137, 0.3)',
              borderRadius: 9999,
              padding: '4px 14px',
              fontSize: 11,
              whiteSpace: 'nowrap',
              color: '#e2e2e2',
              pointerEvents: 'none',
              animation: 'tooltipFadeIn 200ms ease',
            }}
          >
            <span style={{ color: '#ff4b89' }}>♥</span>{' '}
            {petName || 'tap to name me'}
          </div>
        )}

        {/* Animation wrapper */}
        <div className={animClass} style={{ display: 'inline-block' }}>
          <PetComponent state={petState} size={52} />
        </div>
      </div>
    </div>
  )
}
