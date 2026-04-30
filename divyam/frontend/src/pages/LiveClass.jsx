import React, { useEffect, useRef, useState } from 'react'
import Loader from '../components/Loader.jsx'

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function LiveClass() {
  const localVideoRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [streamOn, setStreamOn] = useState(false)
  const [roomId, setRoomId] = useState('divyam-demo')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([
    { id: 'm1', at: nowTime(), from: 'System', text: 'Live class prototype ready.' },
  ])

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
    setMessages((m) => [...m, { id: crypto.randomUUID(), at: nowTime(), from: 'You', text }])
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
        style={{ background: 'linear-gradient(135deg,rgba(237,233,254,0.65),rgba(245,243,255,0.55))', borderColor: 'rgba(196,181,253,0.35)' }}
      >
        <h1
          className="text-2xl font-extrabold"
          style={{ fontFamily: 'Poppins,sans-serif', background: 'linear-gradient(135deg,#7C3AED,#C4B5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          🎥 Live Class
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          WebRTC prototype: local preview + chat. Signaling wires to{' '}
          <code className="rounded px-1 text-xs" style={{ background: 'rgba(196,181,253,0.25)', color: '#7C3AED' }}>/ws</code>.
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

      <section className="grid gap-5 md:grid-cols-2" aria-label="Live class content">

        {/* Left: Video + Controls */}
        <div className="space-y-4">
          {/* Video preview */}
          <div
            className="overflow-hidden rounded-2xl border"
            style={{ background: '#0a0a0f', borderColor: 'rgba(139,92,246,0.2)' }}
          >
            <video
              ref={localVideoRef}
              className="aspect-video w-full rounded-2xl bg-black"
              autoPlay
              playsInline
              muted
              aria-label="Local camera preview"
            />
          </div>

          {/* Room ID + Media Controls */}
          <div className="grid gap-3 md:grid-cols-2">
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
              🔌 Backend signaling (ready-to-wire)
            </summary>
            <div className="px-4 pb-4 pt-2 text-sm text-gray-500 leading-relaxed">
              The frontend is configured to proxy WebSockets from{' '}
              <code className="rounded px-1 text-xs" style={{ background: 'rgba(196,181,253,0.25)', color: '#6D28D9' }}>/ws</code>{' '}
              to{' '}
              <code className="rounded px-1 text-xs" style={{ background: 'rgba(196,181,253,0.25)', color: '#6D28D9' }}>ws://localhost:8080</code>.
              {' '}Add a Spring Boot WebSocket endpoint at{' '}
              <code className="rounded px-1 text-xs" style={{ background: 'rgba(196,181,253,0.25)', color: '#6D28D9' }}>/ws/live</code>{' '}
              to support multi-user calls.
            </div>
          </details>
        </div>

        {/* Right: Chat */}
        <div
          className="flex flex-col rounded-2xl border p-4"
          style={{ background: 'rgba(255,255,255,0.65)', borderColor: 'rgba(139,92,246,0.15)', backdropFilter: 'blur(12px)' }}
        >
          <h2 className="text-sm font-semibold text-gray-800 mb-3">💬 Class Chat</h2>

          <div
            className="flex-1 overflow-auto rounded-xl border p-3 space-y-2 min-h-64"
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
        </div>
      </section>
    </div>
  )
}
