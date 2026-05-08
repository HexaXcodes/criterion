import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/feed', label: 'FEED', icon: FeedIcon },
  { to: '/discover', label: 'DISCOVER', icon: DiscoverIcon },
  { to: '/communities', label: 'CLUBS', icon: ClubsIcon },
  { to: '/profile', label: 'PROFILE', icon: ProfileIcon },
]

export default function BottomNav() {
  return (
    <nav
      className="z-nav fixed bottom-0 left-0 right-0 safe-area-bottom"
      style={{
        background: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto px-2 py-2">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
                  isActive ? 'text-pink-neon' : 'text-text-muted'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'rgba(255, 75, 137, 0.08)',
                      boxShadow: '0 0 20px rgba(255, 75, 137, 0.15)',
                    }
                  : {}
              }
            >
              {({ isActive }) => (
                <>
                  <Icon active={isActive} />
                  <span
                    className="text-[10px] font-semibold tracking-widest"
                    style={{
                      color: isActive ? '#ff4b89' : '#6a6a6a',
                    }}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

function FeedIcon({ active }) {
  const c = active ? '#ff4b89' : '#6a6a6a'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="14" rx="2" stroke={c} strokeWidth="1.6" />
      <path d="M3 10L21 10" stroke={c} strokeWidth="1.6" />
      <path d="M7 4L7 6M17 4L17 6" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function DiscoverIcon({ active }) {
  const c = active ? '#ff4b89' : '#6a6a6a'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.6" />
      <path d="M15 9L13 13L9 15L11 11L15 9Z" fill={c} stroke={c} strokeWidth="1" strokeLinejoin="round" />
    </svg>
  )
}

function ClubsIcon({ active }) {
  const c = active ? '#ff4b89' : '#6a6a6a'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 5C4 4.45 4.45 4 5 4H15C15.55 4 16 4.45 16 5V13L13 11H5C4.45 11 4 10.55 4 10V5Z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 14V17C8 17.55 8.45 18 9 18H17L20 20V13C20 12.45 19.55 12 19 12H17" stroke={c} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function ProfileIcon({ active }) {
  const c = active ? '#ff4b89' : '#6a6a6a'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.6" />
      <path d="M4 21C4 16.58 7.58 13 12 13C16.42 13 20 16.58 20 21" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
