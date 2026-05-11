export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ko', label: 'Korean' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'ar', label: 'Arabic' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'th', label: 'Thai' },
]

// Map a genre string to its background CSS class name
export const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'War',
  'Western',
]

export function genreToBgClass(genre) {
  if (!genre) return 'bg-default'
  const g = genre.toLowerCase()
  if (g.includes('horror')) return 'bg-horror'
  if (g.includes('thriller')) return 'bg-thriller'
  if (g.includes('sci-fi') || g.includes('science fiction')) return 'bg-scifi'
  if (g.includes('action')) return 'bg-action'
  if (g.includes('romance')) return 'bg-romance'
  if (g.includes('comedy')) return 'bg-comedy'
  if (g.includes('drama')) return 'bg-drama'
  if (g.includes('animation')) return 'bg-animation'
  if (g.includes('documentary') || g.includes('history') || g.includes('music')) return 'bg-comedy'
  if (g.includes('crime') || g.includes('mystery') || g.includes('war') || g.includes('western')) return 'bg-thriller'
  if (g.includes('adventure') || g.includes('fantasy') || g.includes('family')) return 'bg-action'
  return 'bg-default'
}

export function timeAgo(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const seconds = Math.floor((Date.now() - date) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export function formatPosterUrl(posterUrl) {
  if (!posterUrl) return null
  return posterUrl
}
