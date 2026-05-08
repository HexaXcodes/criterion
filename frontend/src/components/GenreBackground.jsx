import { genreToBgClass } from '../utils/helpers'

export default function GenreBackground({ genre }) {
  return <div className={`genre-bg ${genreToBgClass(genre)}`} aria-hidden="true" />
}
