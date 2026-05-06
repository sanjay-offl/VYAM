import React, { useEffect, useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import * as faceapi from 'face-api.js'

const { FaceMesh, FACEMESH_TESSELATION, FACEMESH_RIGHT_EYE, FACEMESH_LEFT_EYE } = window
const { Camera } = window
const { drawConnectors } = window
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import Loader from '../components/Loader.jsx'

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function LiveClass() {
  const { user } = useAuth()
  
  // Video & AI Refs
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const cameraRef = useRef(null)
  const faceMeshRef = useRef(null)
  const chatEndRef = useRef(null)
  const wsRef = useRef(null)
  
  // State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [streamOn, setStreamOn] = useState(false)
  
  // AI Metrics
  const [emotion, setEmotion] = useState('Neutral')
  const [confidence, setConfidence] = useState(0)
  const [focus, setFocus] = useState(0)
  const [eyeMovement, setEyeMovement] = useState(0)
  const [engagement, setEngagement] = useState(0)
  const [timelineData, setTimelineData] = useState([])
  const [insights, setInsights] = useState(['System initialized. Waiting for face...'])
  
  // Live Voice Captions
  const [caption, setCaption] = useState('')
  
  // Chat / Room
  const [roomId, setRoomId] = useState('divyam-demo')
  const [chatInput, setChatInput] = useState('')
  const [chatCollapsed, setChatCollapsed] = useState(false)
  const [wsStatus, setWsStatus] = useState('Connecting...')
  const [messages, setMessages] = useState([
    { id: 'm1', at: nowTime(), from: 'System', text: 'Live AI class initialized.' },
  ])

  // Refs for throttling
  const lastFaceApiTime = useRef(0)
  const lastHistoryTime = useRef(0)
  const focusHistory = useRef([])

  const addInsight = useCallback((msg) => {
    setInsights(prev => {
      const next = [msg, ...prev].slice(0, 4)
      return next
    })
  }, [])

  // Load Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true)
        // Load face-api models
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        await faceapi.nets.faceExpressionNet.loadFromUri('/models/emotion')
        
        setModelsLoaded(true)
        setLoading(false)
        addInsight('AI Models loaded successfully.')
      } catch (err) {
        console.error('Model load error:', err)
        setError('Failed to load AI models. Please ensure they exist in public/models.')
        setLoading(false)
      }
    }
    loadModels()
  }, [addInsight])

  // Voice Captions Listener
  useEffect(() => {
    let timer
    const onVoice = (e) => {
      const text = e?.detail || ''
      setCaption(text)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => setCaption(''), 5000)
    }
    window.addEventListener('divyam:voice', onVoice)
    return () => {
      window.removeEventListener('divyam:voice', onVoice)
      if (timer) clearTimeout(timer)
    }
  }, [])

  // WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/live`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setWsStatus('Connected')
      ws.send(JSON.stringify({ type: 'join', roomId }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'chat') {
          setMessages((m) => [...m, { id: crypto.randomUUID(), at: nowTime(), from: data.from || 'User', text: data.text }])
        }
      } catch { /* ignore */ }
    }

    ws.onclose = () => setWsStatus('Disconnected')

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close()
    }
  }, [roomId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])



  // --- AI Pipeline Logic ---
  const onResults = useCallback(async (results) => {
    if (!canvasRef.current || !webcamRef.current?.video) return
    const video = webcamRef.current.video
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Match canvas to video size
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Mirror drawing if video is mirrored (react-webcam mirrored=true)
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)

    // 1. Draw MediaPipe FaceMesh
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      for (const landmarks of results.multiFaceLandmarks) {
        // Tesselation (Light purple)
        drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, { color: 'rgba(192, 132, 252, 0.2)', lineWidth: 1 })
        // Eyes (Neon purple)
        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, { color: '#A855F7', lineWidth: 2 })
        drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, { color: '#A855F7', lineWidth: 2 })
        
        // Calculate Eye Movement & Focus (Heuristic based on eye points bounding rect)
        // Just mocking rapid movement for visual demo based on variance
        const eyeDist = Math.abs(landmarks[33].x - landmarks[263].x)
        const curFocus = Math.min(100, Math.max(0, Math.floor(eyeDist * 500)))
        const curMovement = Math.min(100, Math.floor(Math.random() * 30 + 20))
        
        setFocus(prev => {
          const newVal = Math.floor(prev * 0.8 + curFocus * 0.2) // smooth
          focusHistory.current.push(newVal)
          if(focusHistory.current.length > 10) focusHistory.current.shift()
          return newVal
        })
        setEyeMovement(curMovement)
      }
    } else {
      setFocus(prev => Math.max(0, prev - 5))
      setEyeMovement(0)
    }

    ctx.restore()

    // 2. Face-API for Expressions (Throttle to save CPU ~ 5fps)
    const now = Date.now()
    if (now - lastFaceApiTime.current > 200) {
      lastFaceApiTime.current = now
      
      const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
      
      if (detections) {
        const exps = detections.expressions
        let topEmotion = 'neutral'
        let maxVal = 0
        for (const [e, val] of Object.entries(exps)) {
          if (val > maxVal) {
            maxVal = val
            topEmotion = e
          }
        }
        
        // Capitalize
        const finalEmotion = topEmotion.charAt(0).toUpperCase() + topEmotion.slice(1)
        const finalConf = Math.round(maxVal * 100)
        
        setEmotion(finalEmotion)
        setConfidence(finalConf)

        // Calculate Engagement
        const eng = Math.floor((focus * 0.6) + (finalConf * 0.4))
        setEngagement(eng)

        // Insights Logic
        if (eng < 40 && topEmotion !== 'Happy') addInsight('Student appears distracted.')
        else if (eng > 85) addInsight('High engagement detected.')
        else if (topEmotion === 'Sad' || topEmotion === 'Angry') addInsight('Negative emotion detected.')
        else if (topEmotion === 'Surprised') addInsight('High attention spike.')
      } else {
        setEmotion('Neutral')
        setConfidence(0)
        setEngagement(prev => Math.max(0, prev - 5))
      }
    }

    // 3. Update Timeline
    if (now - lastHistoryTime.current > 1000) {
      lastHistoryTime.current = now
      setTimelineData(prev => {
        const next = [...prev, { time: nowTime(), engagement: engagement, confidence: confidence }]
        return next.slice(-20) // Keep last 20 seconds
      })
    }
  }, [engagement, confidence, focus, addInsight])

  const startCamera = async () => {
    if (!modelsLoaded) return
    setStreamOn(true)

    // Initialize MediaPipe FaceMesh
    const faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` })
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    faceMesh.onResults(onResults)
    faceMeshRef.current = faceMesh

    // Wait for webcam to be ready
    const checkVideo = setInterval(() => {
      if (webcamRef.current?.video?.readyState === 4) {
        clearInterval(checkVideo)
        const camera = new Camera(webcamRef.current.video, {
          onFrame: async () => {
            if (webcamRef.current?.video) {
              await faceMesh.send({ image: webcamRef.current.video })
            }
          },
          width: 640,
          height: 480
        })
        camera.start()
        cameraRef.current = camera
        addInsight('Camera & AI tracking started.')
      }
    }, 100)
  }

  const stopCamera = () => {
    if (cameraRef.current) cameraRef.current.stop()
    if (faceMeshRef.current) faceMeshRef.current.close()
    setStreamOn(false)
    setFocus(0)
    setEngagement(0)
    setConfidence(0)
    setEmotion('Neutral')
    addInsight('Camera stopped.')
  }

  useEffect(() => {
    return () => {
      if (cameraRef.current) cameraRef.current.stop()
      if (faceMeshRef.current) faceMeshRef.current.close()
    }
  }, [])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    setMessages((m) => [...m, { id: crypto.randomUUID(), at: nowTime(), from: 'You', text: chatInput }])
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'chat', roomId, from: user?.name || 'Student', text: chatInput }))
    }
    setChatInput('')
  }

  return (
    <div className="space-y-6 py-2 pb-24">
      {/* Header */}
      <header
        className="rounded-3xl border px-6 py-5 shadow-glass relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(192,132,252,0.1))', borderColor: 'rgba(139,92,246,0.2)' }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-fuchsia-500 to-indigo-500"></div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🎥 Live AI Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Real-time Emotion, Attention & Voice Analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${wsStatus === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {wsStatus}
            </span>
            <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-xl border border-purple-100">
              <span className="text-xs font-bold text-gray-500">ROOM</span>
              <input value={roomId} onChange={e => setRoomId(e.target.value)} className="w-24 bg-transparent text-sm font-semibold focus:outline-none text-purple-700" />
            </div>
          </div>
        </div>
      </header>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">⚠️ {error}</div>}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Camera & Stats */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Camera Container */}
          <div className="relative rounded-3xl overflow-hidden shadow-glass-lg border border-purple-200 bg-gray-900 group">
            <div className="aspect-video relative w-full">
              {!streamOn ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm z-10">
                  <div className="w-20 h-20 mb-4 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-4">AI Vision System Ready</h3>
                  <button onClick={startCamera} disabled={!modelsLoaded} className="btn bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none shadow-glow hover:scale-105 transition-transform px-8 py-3 rounded-xl font-bold">
                    {loading ? <Loader label="Loading Models..." /> : 'Initialize Camera'}
                  </button>
                </div>
              ) : (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    mirrored={true}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
                  />
                  
                  {/* Live Captions Overlay */}
                  <AnimatePresence>
                    {caption && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none"
                      >
                        <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl max-w-[80%] text-center shadow-2xl">
                          <p className="text-lg font-medium leading-tight">"{caption}"</p>
                          <div className="absolute -bottom-1 left-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent -translate-x-1/2 blur-sm"></div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Emotion Overlay */}
                  <div className="absolute top-4 left-4 z-20 bg-black/40 backdrop-blur border border-white/10 rounded-xl p-3 flex items-center gap-3">
                    <div className="text-2xl">{emotion === 'Happy' ? '😊' : emotion === 'Sad' ? '😢' : emotion === 'Angry' ? '😠' : emotion === 'Surprised' ? '😲' : '😐'}</div>
                    <div>
                      <div className="text-xs text-purple-200 font-bold uppercase tracking-wider">Detected Emotion</div>
                      <div className="text-white font-bold text-lg">{emotion} <span className="text-sm opacity-70">{confidence}%</span></div>
                    </div>
                  </div>

                  {/* Stop Button (Hover) */}
                  <button onClick={stopCamera} className="absolute top-4 right-4 z-20 bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
                    Stop AI Tracking
                  </button>
                </>
              )}
            </div>
          </div>

          {/* AI Metric Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-xl border border-purple-100 rounded-2xl p-4 shadow-glass">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Focus Level</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-indigo-600">{focus}%</span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${focus}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-xl border border-purple-100 rounded-2xl p-4 shadow-glass">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Engagement</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-purple-600">{engagement}</span>
                <span className="text-sm font-semibold text-gray-400 mb-1">/100</span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-purple-500" initial={{ width: 0 }} animate={{ width: `${engagement}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-purple-100 rounded-2xl p-4 shadow-glass">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Eye Activity</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-fuchsia-600">{eyeMovement}%</span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-fuchsia-500" initial={{ width: 0 }} animate={{ width: `${eyeMovement}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Analytics & Chat */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Real-time Timeline */}
          <div className="bg-white/60 backdrop-blur-xl border border-purple-100 rounded-3xl p-5 shadow-glass h-64 flex flex-col">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Timeline
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} tick={{fontSize: 10, fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="engagement" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorEngage)" isAnimationActive={false} />
                  <Area type="monotone" dataKey="confidence" stroke="#EC4899" strokeWidth={2} fillOpacity={1} fill="url(#colorConf)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights Feed */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-5 border border-purple-100 shadow-glass flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">🧠</span> AI Insights
            </h3>
            <div className="space-y-2 flex-1 overflow-auto max-h-40 pr-2">
              <AnimatePresence>
                {insights.map((ins, i) => (
                  <motion.div
                    key={i + ins}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/80 rounded-xl p-3 text-sm font-medium text-gray-700 shadow-sm border border-white"
                  >
                    {ins}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Chat (Collapsible on Mobile) */}
          <div className="bg-white/60 backdrop-blur-xl border border-purple-100 rounded-3xl p-4 shadow-glass">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">💬 Class Chat</h3>
              <button onClick={() => setChatCollapsed(!chatCollapsed)} className="lg:hidden text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                {chatCollapsed ? 'Show' : 'Hide'}
              </button>
            </div>
            
            {!chatCollapsed && (
              <>
                <div className="h-40 overflow-y-auto pr-2 space-y-3 mb-3 custom-scrollbar">
                  {messages.map(m => (
                    <div key={m.id} className={`flex flex-col ${m.from === 'You' ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-gray-400 font-bold mb-0.5">{m.from}</span>
                      <div className={`px-4 py-2 rounded-2xl text-sm ${m.from === 'You' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl shadow-md transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
