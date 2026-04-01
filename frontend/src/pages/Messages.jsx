import { useEffect, useRef, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiArrowLeft, HiChat, HiPaperAirplane } from 'react-icons/hi'
import { useSearchParams, useNavigate } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { useAuth } from '../context/AuthContext'

export default function Messages() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const otherUserId = searchParams.get('user')
  const productId = searchParams.get('product')

  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingConvos, setLoadingConvos] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [typingUser, setTypingUser] = useState(null)
  const wsRef = useRef(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Load conversation list
  const loadConversations = useCallback(async () => {
    try {
      const res = await apiClient.get('/messages/conversations')
      setConversations(res.data.conversations)
      // Set online users from conversation data
      const online = new Set()
      res.data.conversations.forEach((c) => {
        if (c.is_online) online.add(c.user_id)
      })
      setOnlineUsers(online)
    } catch {
      // silently fail
    } finally {
      setLoadingConvos(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Load conversation history when a user is selected
  useEffect(() => {
    if (!otherUserId) return
    setLoading(true)
    apiClient
      .get(`/messages/conversation/${otherUserId}`)
      .then((res) => setMessages(res.data.messages))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoading(false))

    // Mark messages as read
    apiClient.post(`/messages/read/${otherUserId}`).catch(() => {})
  }, [otherUserId])

  // WebSocket connection
  useEffect(() => {
    if (!token) return

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = import.meta.env.VITE_WS_URL || `${wsProtocol}//${window.location.host}`
    const ws = new WebSocket(`${wsHost}/ws/chat?token=${token}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'status') {
        // Online/offline status update
        setOnlineUsers((prev) => {
          const next = new Set(prev)
          if (data.is_online) next.add(data.user_id)
          else next.delete(data.user_id)
          return next
        })
        return
      }

      if (data.type === 'typing') {
        setTypingUser(data.sender_id)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000)
        return
      }

      // Chat message
      if (data.type === 'message') {
        setMessages((prev) => [...prev, data])
        // Refresh conversation list to update unread counts / last message
        loadConversations()
      }
    }

    ws.onerror = () => {}

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [token, loadConversations])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !otherUserId) return

    const payload = {
      receiver_id: otherUserId,
      message: newMessage.trim(),
      product_id: productId || null,
    }

    // Try WebSocket first
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    } else {
      // Fallback to REST
      try {
        await apiClient.post('/messages/send', payload)
        const res = await apiClient.get(`/messages/conversation/${otherUserId}`)
        setMessages(res.data.messages)
      } catch {
        toast.error('Failed to send message')
        return
      }
    }

    setNewMessage('')
  }

  const handleTyping = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && otherUserId) {
      wsRef.current.send(JSON.stringify({ type: 'typing', receiver_id: otherUserId }))
    }
  }

  const selectConversation = (userId) => {
    setSearchParams({ user: userId })
  }

  const activeConvo = conversations.find((c) => c.user_id === otherUserId)

  // Conversation list view (shown when no user selected on mobile, always on desktop)
  const ConversationList = () => (
    <div className={`${otherUserId ? 'hidden md:block' : 'block'} md:w-80 lg:w-96 border-r dark:border-gray-700 flex flex-col h-full`}>
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loadingConvos ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <HiChat className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Message a seller from a product page</p>
          </div>
        ) : (
          conversations.map((convo) => {
            const isActive = convo.user_id === otherUserId
            const isOnline = onlineUsers.has(convo.user_id)
            return (
              <button
                key={convo.user_id}
                onClick={() => selectConversation(convo.user_id)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left
                  ${isActive ? 'bg-primary-50 dark:bg-gray-800' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-primary-900 dark:text-primary-400 font-bold">
                      {convo.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {convo.username}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(convo.last_message_time)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {convo.last_message}
                    </p>
                    {convo.unread_count > 0 && (
                      <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-900 rounded-full">
                        {convo.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
      <div className="card flex h-[75vh] overflow-hidden">
        {/* Conversation list */}
        <ConversationList />

        {/* Chat area */}
        <div className={`${!otherUserId ? 'hidden md:flex' : 'flex'} flex-col flex-1`}>
          {!otherUserId ? (
            <div className="flex-1 flex items-center justify-center text-center text-gray-400">
              <div>
                <HiChat className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose from your existing chats</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b dark:border-gray-700">
                <button
                  onClick={() => setSearchParams({})}
                  className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-primary-900 dark:text-primary-400 font-bold text-sm">
                      {activeConvo?.username?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  {onlineUsers.has(otherUserId) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {activeConvo?.username || 'User'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {onlineUsers.has(otherUserId) ? (
                      <span className="text-green-500">Online</span>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="text-center text-gray-400 py-8">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.sender_id === user?.id
                    return (
                      <div
                        key={msg.id || i}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-primary-900 text-white rounded-br-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isMe ? 'text-primary-200' : 'text-gray-400'
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                {typingUser === otherUserId && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-700 rounded-bl-md">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="border-t dark:border-gray-700 p-4 flex gap-3"
              >
                <input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    handleTyping()
                  }}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary !px-4">
                  <HiPaperAirplane className="w-5 h-5 rotate-90" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
