import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from '../components/Loader.jsx'

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function LiveClass() {
  const { user } = useAuth()
  const localVideoRef = useRef(null)
  const chatEndRef = useRef(null)
  const wsRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [streamOn, setStreamOn] = useState(false)
  const [roomId, setRoomId] = useState('divyam-demo')
  const [chatInput, setChatInput] = useState('')
  const [chatCollapsed, setChatCollapsed] = useState(false)
  const [wsStatus, setWsStatus] = useState('Connecting...')
  const [messages, setMessages] = useState([
    { id: 'm1', at: nowTime(), from: 'System', text: 'Live class initialized.' },
  ])

  // WebSocket Connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/live`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setWsStatus('Connected')
      ws.send(JSON.stringify({ type: 'join', roomId }))
      setMessages((m) => [...m, { id: crypto.randomUUID(), at: nowTime(), from: 'System', text: `Joined room: ${roomId}` }])
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'chat') {
          setMessages((m) => [...m, { id: crypto.randomUUID(), at: nowTime(), from: data.from || 'User', text: data.text }])
        } else if (data.type === 'leave') {
          setMessages((m) => [...m, { id: crypto.randomUUID(), at: nowTime(), from: 'System', text: 'A user left the class.' }])
        }
      } catch (err) {
        console.error('WS Parse Error', err)
      }
    }

    ws.onclose = () => {
      setWsStatus('Disconnected')
      setMessages((m) => [...m, { id: crypto.randomUUID(), at: nowTime(), from: 'System', text: 'Disconnected from server.' }])
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
    }
  }, [roomId])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function startCamera() {
    setError('')
    setLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      setStreamOn(true)
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), at: nowTime(), from: 'System', text: 'Camera and mic started.' },
      ])
    } catch {
      setError('Could not access camera/microphone. Please allow permissions.')
    } finally {
      setLoading(false)
    }
  }

  function stopCamera() {
    const el = localVideoRef.current
    const stream = el?.srcObject
    if (stream?.getTracks) stream.getTracks().forEach((t) => t.stop())
    if (el) el.srcObject = null
    setStreamOn(false)
  }

  function sendMessage(e) {
    e.preventDefault()
    const text = chatInput.trim()
    if (!text) return
    
    // Add locally
    setMessages((m) => [...m, { id: crypto.randomUUID(), at: nowTime(), from: 'You', text }])
    
    // Broadcast via WS
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        roomId,
        from: user?.name || 'Student',
        text
      }))
    }
    
    setChatInput('')
  }

  useEffect(() => {
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6 py-2">

      {/* Header */}
      <header
        className="rounded-2xl border px-6 py-5"
        style={{ background: 'linear-gradient(135deg,rgba(237,233,254,0.65),rgba(224,231,255,0.45))', borderColor: 'rgba(196,181,253,0.35)' }}
      >
        <h1
          className="text-2xl font-extrabold"
          style={{ fontFamily: 'Poppins,sans-serif', background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          🎥 Live Class
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          WebRTC + WebSocket real-time communication. Status:{' '}
          <span className={`font-semibold ${wsStatus === 'Connected' ? 'text-green-600' : 'text-amber-500'}`}>
            {wsStatus}
          </span>
        </p>
      </header>

      {/* Error */}
      {error ? (
        <div
          className="rounded-2xl border px-4 py-3 text-sm text-red-700"
          style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.25)' }}
          role="alert"
        >
          ⚠️ {error}
        </div>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-5" aria-label="Live class content">

        {/* Left: Video + Controls (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Video preview */}
          <div
            className="overflow-hidden rounded-2xl border shadow-glass"
            style={{ background: '#0a0a0f', borderColor: 'rgba(139,92,246,0.25)' }}
          >
            <video
              ref={localVideoRef}
              className="aspect-video w-full bg-black"
              autoPlay
              playsInline
              muted
              aria-label="Local camera preview"
            />
          </div>

          {/* Room ID + Media Controls */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className="rounded-2xl border px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(10px)' }}
            >
              <label htmlFor="room-id" className="text-xs font-semibold uppercase tracking-wider text-gray-400">Room ID</label>
              <input
                id="room-id"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="mt-2 w-full"
                style={{ borderRadius: '10px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                aria-label="Room ID"
              />
            </div>

            <div
              className="rounded-2xl border px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(10px)' }}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Media</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {!streamOn ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="btn btn-primary btn-sm"
                    aria-label="Start camera and microphone"
                  >
                    ▶ Start
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="btn btn-outline btn-sm"
                    aria-label="Stop camera and microphone"
                  >
                    ⏹ Stop
                  </button>
                )}
                {loading ? <Loader label="Starting…" /> : null}
              </div>
            </div>
          </div>

          {/* Signaling info */}
          <details
            className="rounded-2xl border"
            style={{ background: 'rgba(255,255,255,0.55)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium select-none" style={{ color: '#7C3AED' }}>
              🔌 WebSocket Status
            </summary>
            <div className="px-4 pb-4 pt-2 text-sm text-gray-500 leading-relaxed">
              Connected to backend Spring Boot WebSocket at{' '}
              <code className="rounded px-1 text-xs" style={{ background: 'rgba(196,181,253,0.25)', color: '#6D28D9' }}>/ws/live</code>.
              Messages are broadcast to all users in the same Room ID.
            </div>
          </details>
        </div>

        {/* Right: Chat (2 cols on lg) */}
        <div
          className="lg:col-span-2 flex flex-col rounded-2xl border p-4"
          style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">💬 Class Chat</h2>
            <button
              type="button"
              onClick={() => setChatCollapsed((v) => !v)}
              className="btn btn-outline btn-sm md:hidden"
              aria-label={chatCollapsed ? 'Expand chat' : 'Collapse chat'}
            >
              {chatCollapsed ? '▼ Show' : '▲ Hide'}
            </button>
          </div>

          {!chatCollapsed && (
            <>
              <div
                className="flex-1 overflow-auto rounded-xl border p-3 space-y-2 min-h-48 max-h-80 lg:max-h-[28rem]"
                style={{ background: 'rgba(250,250,255,0.7)', borderColor: 'rgba(139,92,246,0.1)' }}
                role="log"
                aria-label="Chat messages"
                aria-live="polite"
              >
                {messages.map((m) => (
                  <div key={m.id} className="space-y-0.5">
                    <div className="text-xs text-gray-400">
                      {m.at} ·{' '}
                      <span
                        className="font-semibold"
                        style={{ color: m.from === 'You' ? '#8B5CF6' : '#6B7280' }}
                      >
                        {m.from}
                      </span>
                    </div>
                    <div className="text-sm text-gray-800 leading-snug">{m.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={sendMessage} className="mt-3 flex gap-2" aria-label="Send chat message">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message…"
                  aria-label="Chat message"
                  style={{ borderRadius: '12px', padding: '0.6rem 0.9rem', fontSize: '0.875rem', flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm shrink-0"
                  aria-label="Send message"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
