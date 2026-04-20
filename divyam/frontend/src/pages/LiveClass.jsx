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
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      setStreamOn(true)
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), at: nowTime(), from: 'System', text: 'Camera and mic started.' },
      ])
    } catch (e) {
      setError('Could not access camera/microphone. Please allow permissions.')
    } finally {
      setLoading(false)
    }
  }

  function stopCamera() {
    const el = localVideoRef.current
    const stream = el?.srcObject
    if (stream?.getTracks) {
      stream.getTracks().forEach((t) => t.stop())
    }
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
    <div className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold text-text">Live Class</h1>
        <p className="mt-1 text-sm text-muted">
          WebRTC prototype: local preview + chat. Signaling can be wired to backend at <span className="text-text">/ws</span>.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-text" role="alert">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2" aria-label="Live class content">
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur">
            <video
              ref={localVideoRef}
              className="aspect-video w-full rounded-2xl bg-black"
              autoPlay
              playsInline
              muted
              aria-label="Local camera preview"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block rounded-2xl border border-white/10 bg-surface/20 px-4 py-3">
              <span className="text-sm text-text">Room ID</span>
              <input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-sm text-text focus:outline-none"
                aria-label="Room ID"
              />
            </label>

            <div className="rounded-2xl border border-white/10 bg-surface/20 px-4 py-3">
              <div className="text-sm text-text">Media</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {!streamOn ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="rounded-xl border border-white/10 bg-gold/15 px-3 py-2 text-sm text-text hover:bg-gold/20 focus:outline-none"
                    aria-label="Start camera and microphone"
                  >
                    Start
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-text hover:bg-white/10 focus:outline-none"
                    aria-label="Stop camera and microphone"
                  >
                    Stop
                  </button>
                )}
                {loading ? <Loader label="Starting…" /> : null}
              </div>
            </div>
          </div>

          <details className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <summary className="cursor-pointer text-sm text-text">Backend signaling (ready-to-wire)</summary>
            <div className="mt-2 text-sm text-muted">
              The frontend is configured to proxy WebSockets from <span className="text-text">/ws</span> to <span className="text-text">ws://localhost:8080</span>.
              Add a Spring Boot WebSocket endpoint at <span className="text-text">/ws/live</span> to support multi-user calls.
            </div>
          </details>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface/20 p-4">
          <h2 className="text-sm font-semibold text-text">Class chat</h2>
          <div
            className="mt-3 h-72 overflow-auto rounded-2xl border border-white/10 bg-black/20 p-3"
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
          >
            {messages.map((m) => (
              <div key={m.id} className="mb-2">
                <div className="text-xs text-muted">
                  {m.at} · <span className="text-text">{m.from}</span>
                </div>
                <div className="text-sm text-text">{m.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="mt-3 flex gap-2" aria-label="Send chat message">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface/50 px-3 py-2 text-sm text-text focus:outline-none"
              placeholder="Type a message"
              aria-label="Chat message"
            />
            <button
              type="submit"
              className="rounded-xl border border-white/10 bg-gold/15 px-4 py-2 text-sm text-text hover:bg-gold/20 focus:outline-none"
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
