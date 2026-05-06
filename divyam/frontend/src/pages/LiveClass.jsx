import React, { useEffect, useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import * as faceapi from 'face-api.js'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

function ts() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }

const EMOTION_EMOJI = { Happy:'😊', Sad:'😢', Angry:'😠', Surprised:'😲', Fearful:'😨', Disgusted:'🤢', Neutral:'😐', Dull:'😴' }
const COLORS = { Happy:'#22c55e', Sad:'#3b82f6', Angry:'#ef4444', Surprised:'#f59e0b', Fearful:'#8b5cf6', Disgusted:'#10b981', Neutral:'#6b7280', Dull:'#94a3b8' }

export default function LiveClass() {
  const { user } = useAuth()
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const neutralCountRef = useRef(0)
  const wsRef = useRef(null)
  const chatEndRef = useRef(null)

  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [streamOn, setStreamOn] = useState(false)
  const [emotion, setEmotion] = useState('Neutral')
  const [confidence, setConfidence] = useState(0)
  const [focus, setFocus] = useState(0)
  const [engagement, setEngagement] = useState(0)
  const [eyeMovement, setEyeMovement] = useState(0)
  const [history, setHistory] = useState([])
  const [insights, setInsights] = useState(['System ready. Click Initialize Camera.'])
  const [caption, setCaption] = useState('')
  const [roomId] = useState('divyam-demo')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([{ id: 'm1', at: ts(), from: 'System', text: 'Live AI class initialized.' }])
  const [wsStatus, setWsStatus] = useState('Offline')
  const [chatCollapsed, setChatCollapsed] = useState(false)

  const pushInsight = useCallback((msg) => setInsights(p => [msg, ...p].slice(0, 5)), [])

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        await faceapi.nets.faceExpressionNet.loadFromUri('/models/emotion')
        setModelsLoaded(true)
        pushInsight('✅ AI models loaded successfully.')
      } catch (e) {
        console.error(e)
        setError('Failed to load AI models. Check /public/models/ paths.')
      } finally {
        setLoading(false)
      }
    })()
  }, [pushInsight])

  useEffect(() => {
    let t; const h = (e) => { setCaption(e.detail || ''); clearTimeout(t); t = setTimeout(() => setCaption(''), 5000) }
    window.addEventListener('divyam:voice', h)
    return () => { window.removeEventListener('divyam:voice', h); clearTimeout(t) }
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const drawOverlay = useCallback((detection) => {
    const video = webcamRef.current?.video
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    if (detection) {
      const box = detection.detection.box
      ctx.strokeStyle = '#A855F7'
      ctx.lineWidth = 3
      ctx.shadowColor = '#A855F7'
      ctx.shadowBlur = 15
      ctx.strokeRect(box.x, box.y, box.width, box.height)
      ctx.shadowBlur = 0
      const pts = detection.landmarks.positions
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, 2*Math.PI)
        ctx.fillStyle = 'rgba(192,132,252,0.7)'; ctx.fill()
      })
      const leye = pts.slice(36, 42), reye = pts.slice(42, 48)
      const eyePts = [...leye, ...reye]
      ctx.strokeStyle = '#C084FC'; ctx.lineWidth = 1.5
      ctx.beginPath(); eyePts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y)); ctx.stroke()
    }
    ctx.restore()
  }, [])

  const runDetection = useCallback(async () => {
    const video = webcamRef.current?.video
    if (!video || video.readyState !== 4 || !modelsLoaded) return
    try {
      const det = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 }))
        .withFaceLandmarks()
        .withFaceExpressions()
      if (!det) {
        drawOverlay(null)
        setFocus(p => Math.max(0, p - 3))
        setEngagement(p => Math.max(0, p - 2))
        neutralCountRef.current++
        if (neutralCountRef.current > 5) { setEmotion('Dull'); pushInsight('😴 Student may be fatigued.') }
        return
      }
      drawOverlay(det)
      neutralCountRef.current = 0
      const exps = det.expressions
      const [topEmotion, topConf] = Object.entries(exps).sort((a,b) => b[1]-a[1])[0]
      const em = topEmotion.charAt(0).toUpperCase() + topEmotion.slice(1)
      const conf = Math.round(topConf * 100)
      const lmk = det.landmarks.positions
      const eyeDist = Math.abs(lmk[39].x - lmk[42].x)
      const faceW = det.detection.box.width
      const eyeRatio = Math.min(100, Math.round((eyeDist / faceW) * 400))
      const foc = Math.min(100, Math.round(conf * 0.5 + eyeRatio * 0.5))
      const eng = Math.min(100, Math.round(foc * 0.6 + conf * 0.4))
      const eyeMov = Math.min(100, Math.round(eyeRatio + Math.random() * 15))
      setEmotion(em); setConfidence(conf); setFocus(foc); setEngagement(eng); setEyeMovement(eyeMov)
      const now = ts()
      const attn = eng > 70 ? 'High' : eng > 40 ? 'Medium' : 'Low'
      setHistory(p => [...p, { time: now, emotion: em, confidence: conf, attention: eng, status: attn }].slice(-20))
      if (em === 'Happy' && conf > 70) pushInsight('😊 High engagement — student is happy!')
      else if (em === 'Sad') pushInsight('😢 Student appears sad.')
      else if (em === 'Surprised') pushInsight('😲 Attention spike detected!')
      else if (em === 'Angry') pushInsight('😠 Negative emotion detected.')
      else if (eng > 80) pushInsight('⚡ High focus — great attention!')
      else if (eng < 35) pushInsight('📉 Low engagement — student distracted.')
    } catch (e) { console.error('Detection error:', e) }
  }, [modelsLoaded, drawOverlay, pushInsight])

  const startCamera = useCallback(async () => {
    if (!modelsLoaded) return
    setStreamOn(true)
    const poll = setInterval(() => {
      if (webcamRef.current?.video?.readyState === 4) {
        clearInterval(poll)
        pushInsight('📷 Camera started. AI tracking active.')
        intervalRef.current = setInterval(runDetection, 1000)
      }
    }, 200)
  }, [modelsLoaded, runDetection, pushInsight])

  const stopCamera = useCallback(() => {
    clearInterval(intervalRef.current)
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setStreamOn(false); setEmotion('Neutral'); setConfidence(0); setFocus(0); setEngagement(0)
    pushInsight('⏹ Camera stopped.')
  }, [pushInsight])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const sendMsg = (e) => {
    e.preventDefault(); if (!chatInput.trim()) return
    setMessages(m => [...m, { id: crypto.randomUUID(), at: ts(), from: 'You', text: chatInput }])
    if (wsRef.current?.readyState === WebSocket.OPEN)
      wsRef.current.send(JSON.stringify({ type: 'chat', roomId, from: user?.name || 'Student', text: chatInput }))
    setChatInput('')
  }

  const attnLabel = engagement > 70 ? 'High' : engagement > 40 ? 'Medium' : 'Low'
  const attnColor = engagement > 70 ? 'text-green-600' : engagement > 40 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="space-y-5 py-2 pb-24">
      <header className="rounded-3xl border px-6 py-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.08))', borderColor: 'rgba(139,92,246,0.25)' }}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily:'Poppins,sans-serif', background:'linear-gradient(135deg,#8B5CF6,#6366F1)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>🎥 Live AI Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Real-time Emotion · Attention · Voice Analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${wsStatus==='Connected'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{wsStatus}</span>
            {streamOn && <button onClick={stopCamera} className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors">⏹ Stop</button>}
          </div>
        </div>
      </header>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">⚠️ {error}</div>}

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-5">
          <div className="relative rounded-3xl overflow-hidden border-2 bg-gray-950 group" style={{ borderColor: 'rgba(139,92,246,0.4)', boxShadow: '0 0 40px rgba(139,92,246,0.15)' }}>
            <div className="aspect-video relative w-full">
              {!streamOn ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-950">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse" style={{ background: 'rgba(139,92,246,0.2)', boxShadow: '0 0 40px rgba(139,92,246,0.3)' }}>
                    <span className="text-4xl">🤖</span>
                  </div>
                  <p className="text-white/80 font-semibold">AI Vision System Ready</p>
                  {loading ? (
                    <div className="flex items-center gap-2 text-purple-300 text-sm"><div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />Loading AI models…</div>
                  ) : (
                    <button onClick={startCamera} disabled={!modelsLoaded} className="px-8 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105 disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', boxShadow: '0 0 30px rgba(139,92,246,0.5)' }}>
                      ⚡ Initialize Camera
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <Webcam ref={webcamRef} audio={false} mirrored={true} className="absolute inset-0 w-full h-full object-cover" videoConstraints={{ width: 640, height: 480, facingMode: 'user' }} />
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none" />
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.55)' }}>
                    <span className="text-2xl">{EMOTION_EMOJI[emotion] || '😐'}</span>
                    <div>
                      <div className="text-[10px] text-purple-300 font-bold uppercase tracking-widest">Emotion</div>
                      <div className="text-white font-extrabold text-base leading-none" style={{ color: COLORS[emotion] || '#fff' }}>{emotion} <span className="text-xs opacity-70 font-normal">{confidence}%</span></div>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 z-20 px-3 py-2 rounded-xl border border-white/10 backdrop-blur-md text-xs font-bold" style={{ background: 'rgba(0,0,0,0.55)', color: engagement > 70 ? '#22c55e' : engagement > 40 ? '#f59e0b' : '#ef4444' }}>
                    👁 {attnLabel} Attention
                  </div>
                  <AnimatePresence>
                    {caption && (
                      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="absolute bottom-5 left-0 right-0 flex justify-center z-20 pointer-events-none">
                        <div className="bg-black/65 backdrop-blur border border-white/15 text-white px-5 py-2.5 rounded-2xl max-w-[80%] text-center shadow-2xl">
                          <p className="text-sm font-medium">"{caption}"</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:'Emotion', value: emotion, sub: `${confidence}%`, color: COLORS[emotion]||'#8B5CF6', icon:'🎭' },
              { label:'Focus', value: `${focus}%`, sub:'level', color:'#6366F1', icon:'🎯' },
              { label:'Engagement', value: `${engagement}`, sub:'/100', color:'#A855F7', icon:'⚡' },
              { label:'Eye Activity', value: `${eyeMovement}%`, sub:'movement', color:'#C084FC', icon:'👁' },
            ].map(c => (
              <div key={c.label} className="bg-white/60 backdrop-blur-xl border border-purple-100 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{c.icon}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{c.label}</span>
                </div>
                <div className="font-black text-xl leading-none" style={{ color: c.color }}>{c.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
                {typeof c.value === 'string' && c.value.includes('%') && (
                  <div className="mt-2 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: c.color }} animate={{ width: c.value }} transition={{ duration: 0.4 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-white/60 backdrop-blur-xl border border-purple-100 rounded-3xl p-4 shadow-sm" style={{ height: '220px' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-gray-700">Live Timeline</span>
              <span className="ml-auto text-[10px] text-gray-400">— Engagement  — Confidence</span>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={history} margin={{ top:2, right:0, left:-25, bottom:0 }}>
                <defs>
                  <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.7}/><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EC4899" stopOpacity={0.7}/><stop offset="95%" stopColor="#EC4899" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0,100]} tick={{ fontSize:9, fill:'#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius:'10px', border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', fontSize:'11px' }} />
                <Area type="monotone" dataKey="attention" name="Engagement" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#gE)" isAnimationActive={false} />
                <Area type="monotone" dataKey="confidence" name="Confidence" stroke="#EC4899" strokeWidth={2} fill="url(#gC)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-4 border border-purple-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">🧠 AI Insights</h3>
            <div className="space-y-2 max-h-32 overflow-auto">
              <AnimatePresence>
                {insights.map((ins, i) => (
                  <motion.div key={i+ins} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} className="bg-white/80 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 border border-white shadow-sm">{ins}</motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-purple-100 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700">📊 Emotion History</h3>
              <span className="text-[10px] text-gray-400">Last {history.length} detections</span>
            </div>
            <div className="max-h-36 overflow-auto">
              {history.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No data yet. Start camera to begin tracking.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-400 border-b border-gray-100">{['Time','Emotion','Conf','Attn'].map(h => <th key={h} className="text-left pb-1.5 font-semibold pr-2">{h}</th>)}</tr></thead>
                  <tbody>
                    {[...history].reverse().slice(0,8).map((r,i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-1 pr-2 text-gray-400">{r.time}</td>
                        <td className="py-1 pr-2 font-semibold" style={{ color: COLORS[r.emotion]||'#374151' }}>{EMOTION_EMOJI[r.emotion]} {r.emotion}</td>
                        <td className="py-1 pr-2 text-gray-600">{r.confidence}%</td>
                        <td className={`py-1 font-semibold ${r.status==='High'?'text-green-600':r.status==='Medium'?'text-yellow-600':'text-red-500'}`}>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl border border-purple-100 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-700">💬 Class Chat</h3>
              <button onClick={() => setChatCollapsed(!chatCollapsed)} className="lg:hidden text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{chatCollapsed?'Show':'Hide'}</button>
            </div>
            {!chatCollapsed && (
              <>
                <div className="h-28 overflow-y-auto space-y-2 mb-2">
                  {messages.map(m => (
                    <div key={m.id} className={`flex flex-col ${m.from==='You'?'items-end':'items-start'}`}>
                      <span className="text-[9px] text-gray-400 mb-0.5">{m.from}</span>
                      <div className={`px-3 py-1.5 rounded-2xl text-xs ${m.from==='You'?'bg-purple-600 text-white':'bg-gray-100 text-gray-700'}`}>{m.text}</div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendMsg} className="flex gap-2">
                  <input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Type…" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  <button type="submit" className="bg-purple-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors">Send</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
