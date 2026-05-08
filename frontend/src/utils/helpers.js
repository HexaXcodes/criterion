// Map a genre string to its background CSS class name
export const GENRES = [
  'Action',
  'Drama',
  'Sci-Fi',
  'Thriller',
  'Horror',
  'Comedy',
  'Romance',
  'Animation',
  'Documentary',
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
  if (g.includes('documentary')) return 'bg-comedy' // shares lime palette
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
