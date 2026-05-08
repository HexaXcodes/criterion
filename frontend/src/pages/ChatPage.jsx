import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { chatApi } from '../api/chat'
import { getSocket } from '../api/socket'
import { useAuth } from '../context/AuthContext'
import { timeAgo } from '../utils/helpers'

export default function ChatPage() {
  const { id: communityId } = useParams()
  const navigate = useNavigate()
  const { user, showToast } = useAuth()

  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const socketRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Load chat rooms
  useEffect(() => {
    setLoadingRooms(true)
    chatApi
      .getRooms(communityId)
      .then((data) => {
        const list = Array.isArray(data) ? data : data.chatRooms || []
        setRooms(list)
        if (list.length > 0) setActiveRoom(list[0])
      })
      .catch(() => showToast('Could not load chat rooms', 'error'))
      .finally(() => setLoadingRooms(false))
  }, [communityId])

  // Socket setup
  useEffect(() => {
    socketRef.current = getSocket()

    socketRef.current.on('newMessage', (msg) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id)
        return exists ? prev : [...prev, msg]
      })
    })

    return () => {
      if (socketRef.current && activeRoom?._id) {
        socketRef.current.emit('leaveRoom', activeRoom._id)
      }
      socketRef.current?.off('newMessage')
    }
  }, [])

  // Load messages when room changes
  useEffect(() => {
    if (!activeRoom) return

    // Leave previous room
    if (socketRef.current) {
      socketRef.current.emit('joinRoom', activeRoom._id)
    }

    setLoadingMessages(true)
    setMessages([])
    chatApi
      .getMessages(communityId, activeRoom._id)
      .then((data) => {
        const msgs = Array.isArray(data) ? data : data.messages || []
        setMessages(msgs)
      })
      .catch(() => showToast('Could not load messages', 'error'))
      .finally(() => setLoadingMessages(false))
  }, [activeRoom, communityId])

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!input.trim() || !activeRoom || !socketRef.current) return

    socketRef.current.emit('sendMessage', {
      roomId: activeRoom._id,
      content: input.trim(),
    })
    setInput('')
    inputRef.current?.focus()
  }

  const isMe = (msg) => {
    const senderId = msg.sender?._id || msg.sender
    return senderId === user?._id
  }

  return (
    <div className="h-screen flex flex-col bg-bg-deep">
      {/* Header */}
      <header
        className="flex-shrink-0 px-4 py-3 flex items-center gap-3 border-b border-white/5"
        style={{ background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(24px)' }}
      >
        <button
          onClick={() => navigate(`/communities/${communityId}`)}
          className="w-8 h-8 rounded-full flex items-center justify-center glass"
          aria-label="back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e2e2e2" strokeWidth="2">
            <path d="M15 18L9 12L15 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <div className="brand-wordmark text-sm">CRITERION</div>
          <div className="text-text-secondary text-xs truncate">
            {activeRoom?.name || 'Chat'}
          </div>
        </div>

        {/* Room tabs if multiple */}
        {rooms.length > 1 && (
          <div className="flex gap-1">
            {rooms.slice(0, 3).map((r) => (
              <button
                key={r._id}
                onClick={() => setActiveRoom(r)}
                className="px-3 py-1 rounded-full text-xs transition"
                style={{
                  background:
                    activeRoom?._id === r._id
                      ? 'rgba(255, 75, 137, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: activeRoom?._id === r._id ? '#ff4b89' : '#9a9a9a',
                  border:
                    activeRoom?._id === r._id
                      ? '1px solid rgba(255, 75, 137, 0.4)'
                      : '1px solid transparent',
                }}
              >
                {r.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loadingRooms || loadingMessages ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-2"
                style={{ flexDirection: i % 3 === 0 ? 'row-reverse' : 'row' }}
              >
                <div
                  className="skeleton rounded-2xl"
                  style={{ width: `${40 + Math.random() * 40}%`, height: 48 }}
                />
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-4xl mb-3">💬</div>
              <p className="text-text-secondary text-sm">No chat rooms yet</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-4xl mb-3">👋</div>
              <p className="text-text-secondary text-sm">Be the first to say something</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const mine = isMe(msg)
              const showSender =
                !mine &&
                (i === 0 ||
                  (msg.sender?._id || msg.sender) !==
                    (messages[i - 1]?.sender?._id || messages[i - 1]?.sender))
              return (
                <div
                  key={msg._id || i}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div style={{ maxWidth: '72%' }}>
                    {showSender && (
                      <div className="text-xs text-pink-neon font-bold mb-1 ml-3">
                        {msg.sender?.name || 'User'}
                      </div>
                    )}
                    <div
                      className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                      style={
                        mine
                          ? {
                              background:
                                'linear-gradient(135deg, #ff4b89, #ff6b9d)',
                              color: '#0a0a0a',
                              fontWeight: 500,
                              borderBottomRightRadius: 6,
                            }
                          : {
                              background: 'rgba(255,255,255,0.06)',
                              backdropFilter: 'blur(16px)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: '#e2e2e2',
                              borderBottomLeftRadius: 6,
                            }
                      }
                    >
                      {msg.content}
                    </div>
                    <div
                      className="text-[10px] mt-1 px-2"
                      style={{
                        color: '#4a3040',
                        textAlign: mine ? 'right' : 'left',
                      }}
                    >
                      {timeAgo(msg.createdAt)}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </>
        )}
      </main>

      {/* Input bar */}
      <footer
        className="flex-shrink-0 px-4 py-3 border-t border-white/5"
        style={{
          background: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(24px)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
      >
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something..."
            className="flex-1 rounded-full px-5 py-3 text-sm outline-none"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#e2e2e2',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full flex items-center justify-center transition disabled:opacity-40"
            style={{
              background: input.trim()
                ? 'linear-gradient(135deg, #ff4b89, #ff6b9d)'
                : 'rgba(255,255,255,0.05)',
            }}
            aria-label="send"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={input.trim() ? '#0a0a0a' : '#4a4a4a'}
              strokeWidth="2.5"
            >
              <path
                d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  )
}
