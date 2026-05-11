import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { moviesApi } from '../api/movies'
import { usersApi } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { GENRES } from '../utils/helpers'
import GenreBackground from '../components/GenreBackground'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import MoviePoster from '../components/MoviePoster'
import StarRating from '../components/StarRating'

export default function DiscoverPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isGuest = params.get('guest') === '1'
  const { isAuthenticated, showToast } = useAuth()

  const [query, setQuery] = useState('')
  const [activeGenre, setActiveGenre] = useState('All')
  const [sort, setSort] = useState('rating_desc')
  const [searchResults, setSearchResults] = useState([])
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchPage, setSearchPage] = useState(1)
  const [searchLoading, setSearchLoading] = useState(false)
  const [forYou, setForYou] = useState([])
  const [topRated, setTopRated] = useState([])
  const [genreSections, setGenreSections] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [preferredLangs, setPreferredLangs] = useState(['en'])
  const [loading, setLoading] = useState(true)

  // Initial load
  useEffect(() => {
    setLoading(true)

    const loaders = [
      moviesApi.getAll({ sort: 'rating', limit: 20 }).then((data) => setTopRated(data)),
    ]

    if (isAuthenticated && !isGuest) {
      loaders.push(
        moviesApi
          .getRecommendationsExplained()
          .then((data) => setForYou((data.recommendations || []).slice(0, 4)))
          .catch(() => {})
      )
      loaders.push(
        usersApi.getProfile().then((profile) => {
          setWatchlist(profile.watchlist || [])
          const langs = profile.preferences?.languages || []
          setPreferredLangs(langs)
          return langs
        }).catch(() => [])
      )
    }

    Promise.all(loaders).finally(() => setLoading(false))
  }, [isAuthenticated, isGuest])

  // Fetch genre sections once preferred langs are known
  useEffect(() => {
    moviesApi.getGenreSections(20, preferredLangs)
      .then((data) => setGenreSections(data))
      .catch(() => {})
  }, [preferredLangs])

  // Reset page when query, genre, or sort changes
  useEffect(() => {
    setSearchPage(1)
    setSearchResults([])
    setSearchTotal(0)
  }, [query, activeGenre, sort])

  useEffect(() => {
    if (!query && activeGenre === 'All') {
      setSearchResults([])
      setSearchTotal(0)
      return
    }
    const t = setTimeout(() => {
      setSearchLoading(true)
      moviesApi
        .search(query, activeGenre, searchPage, 40, sort, preferredLangs)
        .then(({ movies, total }) => {
          setSearchResults((prev) => searchPage === 1 ? movies : [...prev, ...movies])
          setSearchTotal(total)
        })
        .catch(() => {})
        .finally(() => setSearchLoading(false))
    }, searchPage === 1 ? 400 : 0)
    return () => clearTimeout(t)
  }, [query, activeGenre, searchPage, sort])

  return (
    <div className="min-h-screen relative">
      <GenreBackground genre={activeGenre !== 'All' ? activeGenre : null} />

      <TopBar />

      <main className="z-content relative pb-28 px-4 pt-2">
        {/* Search bar */}
        <div
          className="rounded-full flex items-center px-4 py-3 mb-4 mt-2"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 75, 137, 0.3)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mr-2">
            <circle cx="11" cy="11" r="7" stroke="#ff4b89" strokeWidth="2" />
            <path d="M20 20L17 17" stroke="#ff4b89" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            placeholder="Search cinematic universes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>

        {/* Genre filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scroll-x">
          <GenrePill
            label="All"
            active={activeGenre === 'All'}
            onClick={() => setActiveGenre('All')}
          />
          {GENRES.map((g) => (
            <GenrePill
              key={g}
              label={g}
              active={activeGenre === g}
              onClick={() => setActiveGenre(g)}
            />
          ))}
        </div>

        {/* Sort controls — visible when browsing genre or searching */}
        {(query || activeGenre !== 'All') && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scroll-x">
            <span className="text-text-muted text-xs tracking-widest font-bold flex-shrink-0">SORT</span>
            {[
              { key: 'rating_desc', label: '★ High → Low' },
              { key: 'rating_asc',  label: '★ Low → High' },
              { key: 'alpha',       label: 'A → Z' },
              { key: 'alpha_desc',  label: 'Z → A' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'Space Grotesk',
                  cursor: 'pointer',
                  flexShrink: 0,
                  background: sort === key ? 'linear-gradient(135deg,#ff4b89,#ff2070)' : 'rgba(255,255,255,0.05)',
                  border: sort === key ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: sort === key ? '#fff' : '#9a9a9a',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Search / genre results */}
        {(query || activeGenre !== 'All') && (
          <>
            {searchResults.length > 0 && (
              <Section
                title={activeGenre !== 'All' ? activeGenre : 'Results'}
                subtitle={`${searchTotal} FILMS`}
              >
                <CompactGrid movies={searchResults} navigate={navigate} />
              </Section>
            )}
            {searchLoading && (
              <div className="flex justify-center py-6">
                <div className="skeleton w-10 h-10 rounded-full" />
              </div>
            )}
            {!searchLoading && searchResults.length === 0 && (
              <p className="text-text-muted text-center py-10 text-sm">No films found</p>
            )}
            {!searchLoading && searchResults.length < searchTotal && (
              <button
                onClick={() => setSearchPage((p) => p + 1)}
                className="w-full py-3 rounded-2xl text-sm font-bold"
                style={{
                  background: 'rgba(255,75,137,0.1)',
                  border: '1px solid rgba(255,75,137,0.3)',
                  color: '#ff4b89',
                  marginTop: 8,
                }}
              >
                Load More ({searchResults.length} / {searchTotal})
              </button>
            )}
          </>
        )}

        {(!query && activeGenre === 'All') && (
          <>
            {/* For You */}
            {isAuthenticated && !isGuest && forYou.length > 0 && (
              <Section title="For You" subtitle="RECOMMENDED" subtitleColor="#00dbe9">
                <HorizontalScroll>
                  {forYou.map((m) => (
                    <MiniCard key={m._id || m.id} movie={m} navigate={navigate} />
                  ))}
                </HorizontalScroll>
              </Section>
            )}

            {/* Top Rated */}
            <Section title="Top Rated" subtitle="ALL TIME" subtitleColor="#00dbe9">
              <HorizontalScroll>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton flex-shrink-0" style={{ width: 120, height: 180 }} />
                  ))
                ) : (
                  topRated.map((m) => (
                    <MiniCard key={m._id || m.id} movie={m} navigate={navigate} />
                  ))
                )}
              </HorizontalScroll>
            </Section>

            {/* Your Watchlist */}
            {isAuthenticated && !isGuest && watchlist.length > 0 && (
              <Section title="Your Watchlist" subtitle={`${watchlist.length} ITEMS`} subtitleColor="#00dbe9">
                <HorizontalScroll>
                  {watchlist.map((m) => (
                    <MiniCard key={m._id} movie={m} navigate={navigate} />
                  ))}
                </HorizontalScroll>
              </Section>
            )}

            {/* Genre rows — one horizontal scroll per genre */}
            {genreSections.map(({ genre, movies }) => (
              <Section
                key={genre}
                title={genre}
                subtitle="TOP PICKS"
                subtitleColor="#ff4b89"
                onSubtitleClick={() => setActiveGenre(genre)}
              >
                <HorizontalScroll>
                  {movies.map((m) => (
                    <MiniCard key={m._id} movie={m} navigate={navigate} />
                  ))}
                </HorizontalScroll>
              </Section>
            ))}

            {/* Placeholder rows while genre sections load */}
            {loading && genreSections.length === 0 && Array.from({ length: 4 }).map((_, i) => (
              <Section key={i} title="" subtitle="">
                <HorizontalScroll>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <div key={j} className="skeleton flex-shrink-0 rounded-xl" style={{ width: 120, height: 180 }} />
                  ))}
                </HorizontalScroll>
              </Section>
            ))}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

function GenrePill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-2 rounded-full transition ${active ? 'btn-primary' : ''}`}
      style={{
        background: active ? undefined : 'rgba(255, 255, 255, 0.05)',
        border: active ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
        color: active ? '#0a0a0a' : '#e2e2e2',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        padding: active ? '8px 20px' : '8px 18px',
        boxShadow: active ? '0 0 20px rgba(255, 75, 137, 0.4)' : 'none',
      }}
    >
      {label}
    </button>
  )
}

function Section({ title, subtitle, subtitleColor = '#00dbe9', onSubtitleClick, children }) {
  return (
    <section className="mb-8">
      <div className="flex items-end justify-between mb-3">
        <h2 className="display-glow text-2xl" style={{ letterSpacing: '0.02em' }}>
          {title}
        </h2>
        {subtitle && (
          <button
            onClick={onSubtitleClick}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: onSubtitleClick ? 'pointer' : 'default',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: subtitleColor,
              fontFamily: 'Space Grotesk',
            }}
          >
            {subtitle}{onSubtitleClick ? ' →' : ''}
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function MiniCard({ movie, navigate }) {
  const id = movie._id || movie.id
  return (
    <button
      onClick={() => navigate(`/movie/${id}`)}
      className="text-left rounded-xl overflow-hidden glass relative active:scale-95 transition flex-shrink-0"
      style={{ width: 120 }}
    >
      <div className="relative">
        <MoviePoster
          posterUrl={movie.posterUrl}
          title={movie.title}
          size="w342"
          className="w-full"
          style={{ aspectRatio: '2/3' }}
        />
        {movie.averageRating ? (
          <div
            className="absolute top-1 right-1 chip-pink flex items-center gap-0.5"
            style={{ padding: '2px 4px', fontSize: 8 }}
          >
            <span>★</span>
            <span>{Number(movie.averageRating).toFixed(1)}</span>
          </div>
        ) : null}
      </div>
      <div style={{ padding: '4px 6px 6px' }}>
        <div
          className="text-text-primary font-bold truncate"
          style={{ fontFamily: 'Space Grotesk', fontSize: 10, lineHeight: 1.3 }}
        >
          {movie.title}
        </div>
      </div>
    </button>
  )
}

function Grid({ movies, navigate, explained }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {movies.map((m) => (
        <PosterCard key={m._id || m.id} movie={m} navigate={navigate} explained={explained} />
      ))}
    </div>
  )
}

function CompactGrid({ movies, navigate }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {movies.map((m) => (
        <PosterCard key={m._id || m.id} movie={m} navigate={navigate} mini />
      ))}
    </div>
  )
}

function HorizontalScroll({ children }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scroll-x">{children}</div>
  )
}

function PosterCard({ movie, navigate, compact, explained, mini }) {
  const id = movie._id || movie.id
  return (
    <button
      onClick={() => navigate(`/movie/${id}`)}
      className="text-left rounded-xl overflow-hidden glass relative active:scale-95 transition flex-shrink-0"
      style={{ width: compact ? 140 : '100%' }}
    >
      <div className="relative">
        <MoviePoster
          posterUrl={movie.posterUrl}
          title={movie.title}
          size="w780"
          className="w-full"
          style={{ aspectRatio: '2/3' }}
        />
        {/* Rating badge */}
        {movie.averageRating ? (
          <div
            className="absolute top-1.5 right-1.5 chip-pink flex items-center gap-0.5"
            style={{ padding: '2px 5px', fontSize: 9 }}
          >
            <span>★</span>
            <span>{Number(movie.averageRating).toFixed(1)}</span>
          </div>
        ) : null}
      </div>

      {/* Mini mode: just the title, very compact */}
      {mini ? (
        <div style={{ padding: '5px 6px 7px' }}>
          <div
            className="text-text-primary font-bold truncate"
            style={{ fontFamily: 'Space Grotesk', fontSize: 10, lineHeight: 1.3 }}
          >
            {movie.title}
          </div>
        </div>
      ) : (
        <div className="p-3">
          <div className="text-text-primary font-bold text-sm truncate" style={{ fontFamily: 'Space Grotesk' }}>
            {movie.title}
          </div>
          {explained && movie.explanation && (
            <div className="text-text-secondary text-xs mt-1 line-clamp-2 leading-relaxed">
              {movie.explanation}
            </div>
          )}
          {!explained && (
            <div className="text-text-muted text-xs mt-1 truncate">
              {movie.genre?.slice(0, 2).join(' • ')}
            </div>
          )}
          {movie.averageRating ? (
            <div className="mt-2">
              <StarRating rating={movie.averageRating} size={11} color="#00dbe9" />
            </div>
          ) : null}
        </div>
      )}
    </button>
  )
}
