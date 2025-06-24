import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind, RotateCcw, Clock, Calendar, Users, MessageSquare } from 'lucide-react'
import { useUser } from 'contexts/UserContext'
import { useGameContext } from 'contexts/GameContext'
import Chat from './Chat'
import PlayersList from './PlayersList'
import Composition from './Composition'
import { Message } from 'hooks/useGame'
import { Player } from 'types/room'
import 'styles/Game.scss'
import Controls from 'components/Game/Controls'

const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 1.5, 2, 4]

const ReplayPage: React.FC = () => {
  const { id: gameId } = useParams<{ id: string }>()
  const { user } = useUser()
  const navigate = useNavigate()
  const {
    roomData,
    players: contextPlayers,
    messages: contextMessages,
    isNight: initialNight,
    creator,
    gameStarted,
    gameFinished,
  } = useGameContext()

  // Données archivées avec types explicites
  const [allMessages, setAllMessages] = useState<Message[]>([])
  const [snapshotPlayers, setSnapshotPlayers] = useState<Player[]>([])
  const [phase, setPhase] = useState<'day' | 'night'>(initialNight ? 'night' : 'day')
  const [duration, setDuration] = useState<number>(0)
  const [startTime, setStartTime] = useState<number>(0)

  // Lecture
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [speedIndex, setSpeedIndex] = useState<number>(2)
  const playbackSpeed = PLAYBACK_SPEEDS[speedIndex]

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTsRef = useRef<number>(Date.now())

  // Initialisation du replay à partir du contexte
  useEffect(() => {
    if (!roomData) return
    setSnapshotPlayers(contextPlayers)
    const sorted = [...contextMessages]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(m => ({ ...m, _shown: false } as Message & { _shown: boolean }))
    setAllMessages(sorted)
    const start = sorted.length ? new Date(sorted[0].createdAt).getTime() : Date.now()
    const end = sorted.length ? new Date(sorted[sorted.length - 1].createdAt).getTime() : start
    setStartTime(start)
    setDuration(end - start)
    setPhase(initialNight ? 'night' : 'day')
  }, [roomData, contextPlayers, contextMessages, initialNight])

  // Affiche les messages jusqu'à currentTime
  const processMessages = useCallback((t: number) => {
    const base = startTime
    setAllMessages(prev =>
      prev.map(m => {
        if (!(m as any)._shown && new Date(m.createdAt).getTime() - base <= t) {
          return { ...m, _shown: true }
        }
        return m
      })
    )
  }, [startTime])

  // Boucle de replay
  useEffect(() => {
    if (!isPlaying) return
    lastTsRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const delta = (now - lastTsRef.current) * playbackSpeed
      lastTsRef.current = now
      setCurrentTime(ct => {
        const next = Math.min(ct + delta, duration)
        processMessages(next)
        if (next >= duration) setIsPlaying(false)
        return next
      })
    }, 1000 / 60)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, playbackSpeed, duration, processMessages])

  // Contrôles
  const handlePlayPause = () => {
    setIsPlaying(p => !p)
    lastTsRef.current = Date.now()
  }
  const handleRestart = () => {
    setIsPlaying(false)
    setAllMessages(prev => prev.map(m => ({ ...m, _shown: false })))
    setCurrentTime(0)
    setSnapshotPlayers(contextPlayers)
    setPhase(initialNight ? 'night' : 'day')
  }
  const handleSpeedChange = () => setSpeedIndex(i => (i + 1) % PLAYBACK_SPEEDS.length)
  const handleSkip = (sec: number) => {
    const next = Math.max(0, Math.min(currentTime + sec * 1000, duration))
    setIsPlaying(false)
    setCurrentTime(next)
    processMessages(next)
  }
  const handleSeek = (pct: number) => {
    const t = (pct / 100) * duration
    handleRestart()
    setCurrentTime(t)
    processMessages(t)
  }

  // Formatage
  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }
  const formatDate = (ts: number) => new Date(ts).toLocaleString('fr-FR')

  if (!roomData) return null

  const shownMessages = allMessages.filter(m => (m as any)._shown)
  const progress = duration ? (currentTime / duration) * 100 : 0

  if (!gameFinished) {
    return (
      <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black flex items-center justify-center text-white">
        <div className="bg-black/60 backdrop-blur-md rounded-xl border border-red-500/30 p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Replay indisponible</h1>
          <p className="text-gray-400">Impossible de charger le replay de la partie car celle ci n'est pas terminée.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg transition-all"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <Box
      className="game-page"
      display="flex"
      flexDirection="column"
      sx={{
        backgroundImage: phase === 'night'
          ? 'url(/assets/images/games/background-night.png)'
          : 'url(/assets/images/games/background2.png)',
        backgroundSize: 'cover',
        minHeight: '100vh',
      }}
    >
      {/* Header Replay */}
      <div className="relative z-10 bg-gradient-to-r from-black/80 to-purple-900/30 backdrop-blur-sm border-b border-purple-500/30 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-3">
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-1 bg-purple-600/80 text-white text-xs font-bold rounded-full">
                  REPLAY
                </span>
                <h1 className="text-xl font-bold text-white">{roomData.name}</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-purple-300">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(startTime)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {contextPlayers.length} joueurs
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {shownMessages.length} messages
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {phase === 'night' ? 'Phase nocturne' : 'Phase diurne'}
                </span>
              </div>
            </div>
          </div>
          <motion.button
            onClick={() => navigate('/')}
            className="px-3 py-1 bg-gray-900/40 hover:bg-gray-900/60 text-gray-300 hover:text-white border border-gray-500/30 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retour à l'accueil
          </motion.button>
        </div>
      </div>
      {/* Contenu principal */}
      <Box display="flex" flex={1} p={2}>
        <Box width="25%" mr={2}>
          <Controls
            gameId={gameId}
            roomData={roomData}
            fetchGameDetails={() => null}
            isCreator={false}
            creator={creator!}
            canBeReady={false}
            canStartGame={false}
            player={null}
            players={snapshotPlayers}
            gameStarted={gameStarted}
            gameFinished={gameFinished}
            isArchive={true}
            setGameStarted={() => null}
            slots={roomData.maxPlayers}
            setSlots={() => null}
            setRoomData={() => null}
            isInn={false}
            viewer={null}
            setPlayer={() => null}
            activeGuideSession={null}
          />

          <div className="relative z-10 bg-black/60 backdrop-blur-sm border-b border-purple-500/20 px-4 py-3 mt-4">
            <div className="container mx-auto">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2 text-sm text-purple-300">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-xs bg-purple-900/50 px-2 py-1 rounded">{playbackSpeed}x</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div
                  className="w-full h-2 bg-gray-800 rounded-full cursor-pointer relative overflow-hidden"
                  onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    handleSeek(((e.clientX - rect.left) / rect.width) * 100)
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute top-0 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1 -translate-x-2 cursor-grab"
                    style={{ left: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <motion.button
                  onClick={handleRestart}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => handleSkip(-10)}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Rewind className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => handleSkip(-5)}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipBack className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={handlePlayPause}
                  className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </motion.button>
                <motion.button
                  onClick={() => handleSkip(5)}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <SkipForward className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => handleSkip(10)}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white rounded-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FastForward className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={handleSpeedChange}
                  className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white rounded-lg text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {playbackSpeed}x
                </motion.button>
              </div>
            </div>
          </div>
        </Box>
        <Box width="50%" mr={2} height="85vh">
          <Chat
            gameId={gameId!}
            playerId={user?.id}
            players={snapshotPlayers}
            messages={shownMessages}
            highlightedPlayers={{}}
            isNight={phase==='night'}
            gameStarted={gameStarted}
            gameFinished={gameFinished}
            gameType={roomData.type}
            hasVoice={false}
            isInn={false}
            isArchive={true}
          />
        </Box>
        <Box width="25%">
          <Composition roomData={roomData} players={snapshotPlayers} />

          <PlayersList
            players={snapshotPlayers}
            player={null}
            viewers={[]}
            viewer={null}
            isCreator={false}
            creatorNickname={roomData.creator}
            gameId={gameId!}
            socket={null}
            toggleHighlightPlayer={()=>{}}
            highlightedPlayers={{}}
            gameStarted={gameStarted}
            gameFinished={gameFinished}
            alienList={[]}
            sistersList={[]}
            brothersList={[]}
            coupleList={[]}
            isNight={phase==='night'}
            isInn={false}
            innList={[]}
            hasVoice={false}
          />
        </Box>
      </Box>

      {/* Footer Replay */}
      <div className="relative z-10 bg-gradient-to-r from-black/80 to-purple-900/30 backdrop-blur-sm border-t border-purple-500/30 py-2 px-4 text-xs text-purple-300">
        <div className="container mx-auto flex justify-between items-center">
          <div>Replay de la partie #{gameId} • {formatDate(startTime)}</div>
          <div>Mode replay • {formatTime(currentTime)} / {formatTime(duration)}</div>
        </div>
      </div>
    </Box>
  )
}

export default ReplayPage
