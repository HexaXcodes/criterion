import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { communitiesApi } from '../api/communities'
import { useAuth } from '../context/AuthContext'
import GenreBackground from '../components/GenreBackground'
import { timeAgo } from '../utils/helpers'

export default function CommunityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, showToast } = useAuth()

  const [community, setCommunity] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [activePost, setActivePost] = useState(null)
  const [upvoted, setUpvoted] = useState(new Set())

  const isMember = community?.members?.some(
    (m) => (m._id || m) === user?._id
  )

  const load = () => {
    setLoading(true)
    Promise.all([
      communitiesApi.getById(id).then(setCommunity).catch(() => null),
      communitiesApi.getPosts(id).then(setPosts).catch(() => []),
    ]).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [id])

  const handleJoinLeave = async () => {
    try {
      if (isMember) {
        await communitiesApi.leave(id)
        showToast('Left community', 'info')
      } else {
        await communitiesApi.join(id)
        showToast('Joined!', 'success')
      }
      load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update', 'error')
    }
  }

  const handleUpvote = async (postId) => {
    try {
      await communitiesApi.upvotePost(id, postId)
      setUpvoted((s) => new Set([...s, postId]))
      setPosts((ps) =>
        ps.map((p) =>
          p._id === postId ? { ...p, upvoteCount: (p.upvoteCount || 0) + 1 } : p
        )
      )
    } catch (err) {
      showToast('Could not upvote', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="skeleton w-full h-32 rounded-2xl mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton w-full h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-deep">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Club not found</p>
          <button onClick={() => navigate('/communities')} className="btn-primary">
            All clubs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative pb-24">
      <GenreBackground genre={community.genre} />

      {/* Back nav */}
      <header className="z-content sticky top-0 px-4 py-3 backdrop-blur-md bg-black/40 border-b border-white/5 flex items-center justify-between">
        <button onClick={() => navigate('/communities')} className="text-text-secondary text-sm">
          ← Clubs
        </button>
        <span className="brand-wordmark text-sm">CRITERION</span>
        <button
          onClick={() => navigate(`/communities/${id}/chat`)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255, 75, 137, 0.1)', border: '1px solid rgba(255, 75, 137, 0.3)' }}
          aria-label="chat"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4b89" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      <main className="z-content relative px-4 pt-4">
        {/* Header card */}
        <div className="glass-strong rounded-3xl p-6 mb-5">
          <span className="chip-genre inline-block mb-3">{community.genre}</span>
          <h1 className="display-glow text-3xl mb-2">{community.name}</h1>
          <p className="text-text-secondary text-sm mb-4">{community.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              <span className="text-pink-neon font-bold">
                {community.memberCount || community.members?.length || 0}
              </span>{' '}
              members
            </span>
            <button
              onClick={handleJoinLeave}
              className={isMember ? 'btn-secondary text-xs' : 'btn-primary text-xs'}
              style={{ padding: '8px 18px' }}
            >
              {isMember ? 'Leave' : 'Join'}
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="mb-3 flex items-center gap-2">
          <h2 className="display-glow text-xl">Feed</h2>
          <span className="text-xs text-text-muted">— {posts.length} posts</span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">No posts yet — be first</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                upvoted={upvoted.has(post._id)}
                onUpvote={() => handleUpvote(post._id)}
                onOpen={() => setActivePost(post)}
              />
            ))}
          </div>
        )}

        {/* Create post FAB (only if member) */}
        {isMember && (
          <button
            onClick={() => setShowCreate(true)}
            className="fixed bottom-8 right-5 w-14 h-14 rounded-full flex items-center justify-center btn-primary z-content"
            style={{ padding: 0 }}
            aria-label="Create post"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3">
              <path d="M12 5V19M5 12H19" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </main>

      {showCreate && (
        <CreatePostModal
          communityId={id}
          onClose={() => setShowCreate(false)}
          onCreated={(p) => {
            setPosts([p, ...posts])
            setShowCreate(false)
          }}
        />
      )}

      {activePost && (
        <PostDetailSheet
          communityId={id}
          post={activePost}
          onClose={() => setActivePost(null)}
        />
      )}
    </div>
  )
}

function PostCard({ post, upvoted, onUpvote, onOpen }) {
  return (
    <div className="glass rounded-2xl p-4 active:scale-98 transition">
      <div className="flex items-center gap-2 text-xs mb-2">
        <span className="text-pink-neon font-bold">@{post.user?.name || post.author?.name || 'user'}</span>
        <span className="text-text-muted">• {timeAgo(post.createdAt)}</span>
      </div>
      <button onClick={onOpen} className="text-left w-full">
        <h3 className="text-text-primary font-bold mb-1" style={{ fontFamily: 'Space Grotesk' }}>
          {post.title}
        </h3>
        {post.content && (
          <p className="text-text-secondary text-sm line-clamp-2 mb-3">{post.content}</p>
        )}
      </button>
      <div className="flex items-center gap-4 text-xs">
        <button
          onClick={onUpvote}
          className="flex items-center gap-1 transition"
          style={{ color: upvoted ? '#ff4b89' : '#888' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={upvoted ? '#ff4b89' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M7 14L12 9L17 14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-bold">{post.upvoteCount || 0}</span>
        </button>
        <button onClick={onOpen} className="flex items-center gap-1 text-text-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" />
          </svg>
          <span className="font-bold">{post.commentCount || 0}</span>
        </button>
      </div>
    </div>
  )
}

function CreatePostModal({ communityId, onClose, onCreated }) {
  const { showToast } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const post = await communitiesApi.createPost(communityId, { title, content })
      showToast('Posted', 'success')
      onCreated(post.post || post)
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not post', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="z-modal fixed inset-0 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full max-w-md rounded-3xl p-6 animate-slide-up"
      >
        <h2 className="display-glow text-2xl mb-4">New Post</h2>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="input-glass mb-3"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={4}
          className="input-glass mb-4 resize-none"
        />
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 text-sm disabled:opacity-50">
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}

function PostDetailSheet({ communityId, post, onClose }) {
  const { showToast } = useAuth()
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    communitiesApi
      .getComments(communityId, post._id)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false))
  }, [communityId, post._id])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      const result = await communitiesApi.addComment(communityId, post._id, comment)
      setComments([...comments, result.comment || result])
      setComment('')
    } catch (err) {
      showToast('Could not add comment', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="z-modal fixed inset-0 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full max-w-lg rounded-t-3xl p-6 animate-slide-up flex flex-col"
        style={{ maxHeight: '85vh' }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="text-xs text-text-muted mb-1">
              <span className="text-pink-neon font-bold">
                @{post.user?.name || post.author?.name || 'user'}
              </span>{' '}
              • {timeAgo(post.createdAt)}
            </div>
            <h3 className="text-xl font-bold text-text-primary" style={{ fontFamily: 'Space Grotesk' }}>
              {post.title}
            </h3>
          </div>
          <button onClick={onClose} className="text-text-muted text-2xl pl-3">
            ×
          </button>
        </div>
        {post.content && <p className="text-text-secondary text-sm mb-4">{post.content}</p>}

        <div className="border-t border-white/5 pt-4 flex-1 overflow-y-auto">
          <p className="text-xs font-bold tracking-widest text-text-muted uppercase mb-3">
            Comments ({comments.length})
          </p>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-4">Start the conversation</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="glass rounded-xl p-3">
                    <div className="text-xs text-pink-neon font-bold mb-1">
                      @{c.author?.name || c.user?.name || 'user'}
                    </div>
                    <p className="text-sm text-text-primary">{c.content}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Comment input */}
        <form onSubmit={handleAdd} className="flex gap-2 mt-3">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="input-glass flex-1"
          />
          <button type="submit" disabled={submitting || !comment.trim()} className="btn-primary px-5 text-sm disabled:opacity-50">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
