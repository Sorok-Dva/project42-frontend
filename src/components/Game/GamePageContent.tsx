'use client'

import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import { Container, Spinner } from 'reactstrap'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import { useSocket } from 'contexts/SocketContext'
import { useGameContext } from 'contexts/GameContext'
import { useYouTubeAudioPlayer } from 'hooks/useYoutubeAudioPlayer'
import { Mic, Flag, Ghost, Lock } from 'lucide-react'
import { Tooltip } from 'react-tooltip'

import { fetchGameDetails, leaveGame } from 'services/gameService'
import Controls from './Controls'
import Chat from './Chat'
import PlayersList from './PlayersList'
import { getRandomColor } from 'utils/getRandomColor'

import 'styles/Game.scss'
import Composition from './Composition'
import { parallaxStars, staticStars } from 'utils/animations'
import GuideRequestModal from './GuideRequestModal'
import GuideChat from './GuideChat'
import BugReportModal from './BugReportModal'
import ThrownItem from './ThrownItem'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import DevCommandsPanel from 'components/Game/Tools/DevCommandsPanel'
import ParameterCommandsPanel from 'components/Game/Tools/ParameterCommandsPanel'
import { MultiAvatarCanvas } from 'components/Avatar/MultiScene'
import PremiumPanel from './PremiumPanel'

export const GAME_TYPES: Record<number, string> = {
  0: 'Normal',
  1: 'Fun',
  2: 'Sérieuse',
  3: 'Carnage',
  4: 'Spéciale',
  5: 'Test',
}

export const gameTypeColors = {
  0: 'text-green-500', // Normale
  1: 'text-blue-500', // Fun
  2: 'text-red-500', // Sérieuse
  3: 'text-purple-500', // Carnage
  4: 'text-yellow-400', // Animation
  5: 'text-orange-500', // Test
}

/**
 * The GamePage component manages and renders the game interface, user interactions, and real-time updates.
 * It integrates various elements like player controls, chat, and a list of players.
 *
 * @return {JSX.Element} The rendered JSX for the main game interface, including headers, chat, controls, and player list.
 */
const GamePage = () => {
  const { id: gameId } = useParams<{ id: string }>()
  const { user } = useUser()
  const { token } = useAuth()
  const { socket } = useSocket()

  const premiumDate = user?.premium ? new Date(user.premium) : null
  const isPremium = premiumDate ? new Date().getTime() < premiumDate.getTime() : false

  const [guideRequestDetails, setGuideRequestDetails] = useState<{
    guideUserId: number;
    guideNickname: string;
    roomId: number;
  } | null>(null)
  const [showGuideRequestModal, setShowGuideRequestModal] = useState(false)
  const [activeGuideSession, setActiveGuideSession] = useState<{
    partnerNickname: string;
    amIGuide: boolean;
  } | null>(null)

  const [highlightedPlayers, setHighlightedPlayers] = useState<{ [nickname: string]: string }>({})
  const [showBugReportModal, setShowBugReportModal] = useState(false)
  const [thrownItems, setThrownItems] = useState<{ id: string; image: string }[]>([])
  const [showPremiumPanel, setShowPremiumPanel] = useState(false)

  const removeThrownItem = (id: string) => {
    setThrownItems(prev => prev.filter(item => item.id !== id))
  }

  // États pour la gestion de la connexion
  const wasDisconnectedRef = useRef(false)
  const [isConnected, setIsConnected] = useState(true)
  const [showDisconnectionModal, setShowDisconnectionModal] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [disconnectionTime, setDisconnectionTime] = useState<Date | null>(null)
  const maxReconnectAttempts = 5
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isKilledByServer = useRef<boolean>(false)

  const [canvasReady, setCanvasReady] = useState(false)

  const [audioPlaying, setAudioPlaying] = useState<boolean>(false)
  const [audioTrack, setAudioTrack] = useState<{
    title: string
    artist: string
    url?: string
    videoId?: string
    // 'src' = flux MP3, 'youtube' = IFrame
    type: 'src' | 'youtube'
  } | null>(null)
  const [audioVolume, setAudioVolume] = useState<number>(0.5)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleVideoInfo = useCallback(
    (info: { video_id: string; title: string; author: string }) => {
      setAudioTrack((prev) =>
        prev && prev.type === 'youtube' ? { ...prev, title: info.title, artist: info.author } : prev,
      )
    },
    [setAudioTrack],
  )

  const handlePlayerEnd = useCallback(() => {
    setAudioPlaying(false)
    setAudioTrack(null)
  }, [])

  const {
    loadAndPlay,
    playVideo,
    pause,
    setVolume: setYTVolume,
  } = useYouTubeAudioPlayer(handleVideoInfo, handlePlayerEnd)

  /**
   * Gestion de la reconnexion automatique
   */
  const attemptReconnection = useCallback(() => {
    setIsReconnecting(true)

    if (reconnectAttempts >= maxReconnectAttempts) {
      setIsReconnecting(false)
      return
    }

    setReconnectAttempts(prev => prev + 1)
  }, [reconnectAttempts])

  useEffect(() => {
    if (!isReconnecting) return

    // Si on a dépassé la limite, on arrête
    if (reconnectAttempts > maxReconnectAttempts) {
      setIsReconnecting(false)
      return
    }

    // Calcul du délai basé sur la tentative courante
    const delay = Math.min(3000 * Math.pow(2, reconnectAttempts - 1), 10000)
    reconnectIntervalRef.current = setTimeout(() => {
      if (socket && isReconnecting) {
        socket.connect()
      }
      setReconnectAttempts(prev => prev + 1)
    }, delay)

    return () => {
      if (reconnectIntervalRef.current) {
        clearTimeout(reconnectIntervalRef.current)
        reconnectIntervalRef.current = null
      }
    }
  }, [reconnectAttempts, isReconnecting, socket])

  /**
   * Gestion manuelle de la reconnexion
   */
  const handleManualReconnect = useCallback(() => {
    setReconnectAttempts(1)
    setIsReconnecting(true)
  }, [])

  /**
   * Toggles the highlighting of a player based on their nickname.
   * If the player is already highlighted, they will be removed from the highlighted list.
   * If the player is not highlighted, they will be added with a random color.
   *
   * @param {string} nickname - The nickname of the player to toggle highlighting for.
   * @returns {void}
   */
  const toggleHighlightPlayer = (nickname: string) => {
    setHighlightedPlayers((prev) => {
      if (prev[nickname]) {
        const newState = { ...prev }
        delete newState[nickname]
        return newState
      } else {
        return { ...prev, [nickname]: getRandomColor() }
      }
    })
  }

  // Hook custom "useGame"
  const {
    roomData,
    player,
    viewer,
    viewers,
    players,
    creator,
    isCreator,
    messages,
    canBeReady,
    canStartGame,
    gameError,
    error,
    loading,
    isNight,
    gameStarted,
    gameFinished,
    passwordRequired,
    isAuthorized,
    password,
    alienList,
    sistersList,
    brothersList,
    coupleList,
    slots,
    isArchive,
    isInn,
    innList,
    premiumPanelData,
    setSlots,
    setPlayer,
    handlePasswordSubmit,
    setPassword,
    setGameError,
    setRoomData,
    setMessages,
    setIsCreator,
    setGameStarted,
    setGameFinished,
    setWinnersAvatars,
    winnersAvatars,
  } = useGameContext()

  // Gestion des événements de connexion socket
  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      console.log('Socket connecté')
      setIsConnected(true)
      setShowDisconnectionModal(false)
      setReconnectAttempts(0)
      setIsReconnecting(false)
      setDisconnectionTime(null)

      // Nettoyer l'intervalle de reconnexion
      if (reconnectIntervalRef.current) {
        clearTimeout(reconnectIntervalRef.current)
        reconnectIntervalRef.current = null
      }

      console.log('was disconnected', wasDisconnectedRef.current)
      if (wasDisconnectedRef.current) {
        wasDisconnectedRef.current = false
        console.log('reload')
        window.location.reload()
      }
    }

    const handleDisconnect = (reason: string) => {
      console.log('isKilledByServer', isKilledByServer)
      if (!isKilledByServer.current) {
        console.log('Socket déconnecté:', reason)
        setIsConnected(false)
        setDisconnectionTime(new Date())

        // Ne pas afficher la modal si c'est une déconnexion volontaire
        if (reason !== 'io client disconnect' && reason !== 'transport close') {
          setShowDisconnectionModal(true)
          wasDisconnectedRef.current = true
          setReconnectAttempts(1)
          setIsReconnecting(true)
        }
      }
    }

    const handleConnectError = (error: Error) => {
      if (!isKilledByServer.current) {
        console.error('Erreur de connexion socket:', error)
        setIsConnected(false)
        setShowDisconnectionModal(true)
        wasDisconnectedRef.current = true
      }
    }

    const handleReconnect = (attemptNumber: number) => {
      console.log('Reconnexion réussie après', attemptNumber, 'tentatives')
      setIsConnected(true)
      setShowDisconnectionModal(false)
      setReconnectAttempts(0)
      setIsReconnecting(false)
    }

    const handleKilledByServer = (reason?: string) => {
      isKilledByServer.current = true
      if (reason?.startsWith('kicked')) {
        setGameError('Vous avez été kick de la partie.')
      } else {
        setGameError('Votre session de jeu à pris fin')
      }
    }

    const handleReconnectError = (error: Error) => {
      console.error('Erreur de reconnexion:', error)
      if (reconnectAttempts < maxReconnectAttempts) {
        attemptReconnection()
      } else {
        setIsReconnecting(false)
      }
    }

    // Écouter les événements de connexion
    socket.on('connection:killed_by_server', handleKilledByServer)
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('reconnect', handleReconnect)
    socket.on('reconnect_error', handleReconnectError)

    // Vérifier l'état initial
    setIsConnected(socket.connected)

    return () => {
      socket.off('connection:killed_by_server', handleKilledByServer)
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('reconnect', handleReconnect)
      socket.off('reconnect_error', handleReconnectError)

      if (reconnectIntervalRef.current) {
        clearTimeout(reconnectIntervalRef.current)
      }
    }
  }, [socket, attemptReconnection])

  // Debug - Écouter tous les événements socket
  useEffect(() => {
    if (!socket) return

    socket.onAny((eventName, ...args) => {
      console.log(`Événement reçu : ${eventName}`, args)
    })

    socket.on('lobby:bip_not_ready_players', () => {
      // Afficher une notification uniquement si le joueur n'est pas prêt
      if (player && !player.ready && player.nickname !== creator?.nickname) {
        // Créer une notification sonore
        const notificationSound = new Audio('/assets/sounds/sos.mp3')
        notificationSound.play().catch((err) => console.error('Erreur lors de la lecture du son:', err))

        // Afficher une alerte visuelle
        const notificationDiv = document.createElement('div')
        notificationDiv.className =
          'fixed top-4 right-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce'
        notificationDiv.innerHTML = `
          <p class="font-bold">Attention !</p>
          <p>${creator?.nickname} vous demande de vous mettre prêt !</p>
        `
        document.body.appendChild(notificationDiv)

        // Supprimer la notification après 5 secondes
        setTimeout(() => {
          notificationDiv.classList.add('opacity-0', 'transition-opacity')
          setTimeout(() => {
            document.body.removeChild(notificationDiv)
          }, 500)
        }, 5000)
      }
    })

    socket.on('music', (data) => {
      // STOPPE toujours tout d'abord
      pause()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }

      if (!data.url || data.url === '') return

      const ytMatch = data.url.match(/(?:youtube\.com\/(?:watch\?.*?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})(?=[?&]|$)/)
      const videoId = ytMatch?.[1] ?? null

      if (videoId) {
        setAudioTrack({ title: data.title, artist: data.artist, videoId, type: 'youtube' })
        loadAndPlay(videoId) // pourra être mis en attente
        setAudioPlaying(true)
      } else {
        const audioUrl = data.url
        setAudioTrack({ title: data.title, artist: data.artist, url: audioUrl, type: 'src' })
        audioRef.current!.src = audioUrl
        audioRef.current!.volume = audioVolume
        audioRef.current!.play().catch(console.error)
        setAudioPlaying(true)
      }
    })

    socket.on('stopMusic', () => {
      if (audioRef.current) {
        audioRef.current.pause()
        setAudioPlaying(false)
      }
    })

    const handleItemThrown = (data: { item: string }) => {
      setThrownItems(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, image: data.item }])
    }

    socket.on('object:thrown', handleItemThrown)

    return () => {
      socket.offAny()
      socket.off('lobby:bip_not_ready_players')
      socket.off('music')
      socket.off('stopMusic')
      socket.off('object:thrown', handleItemThrown)
    }
  }, [socket, player])

  useEffect(() => {
    if (!socket || !gameId || !user) return

    const handleGuideRequestReceived = (data: { guideUserId: number; guideNickname: string; roomId: number }) => {
      setGuideRequestDetails(data)
      setShowGuideRequestModal(true)
    }

    const handleGuideRequestSent = (data: { message: string }) => {
      alert(`Système de guide: ${data.message}`)
    }

    const handleGuideRequestExpired = (data: { playerId?: number; playerNickname?: string; roomId: number; reason: string }) => {
      alert(`Système de guide: la demande a expirée. Raison: ${data.reason}`)
      if (showGuideRequestModal && Number(data.roomId) === Number(gameId)) {
        setShowGuideRequestModal(false)
        setGuideRequestDetails(null)
      }
    }

    const handleGuideRequestRejected = (data: { playerId?: number; playerNickname?: string; guideUserId?: number, reason: string }) => {
      // This event can be for the guide (their request was rejected)
      // or for the player (the request they were considering is no longer valid, e.g. guide busy)
      alert(`Système de guide: Demande rejetée ou invalide. Raison: ${data.reason}`)
      if (showGuideRequestModal) {
        // If the currently open modal's guide matches the guide involved in rejection, close it.
        if (guideRequestDetails && data.guideUserId && data.guideUserId === guideRequestDetails.guideUserId) {
          setShowGuideRequestModal(false)
          setGuideRequestDetails(null)
        } else if (guideRequestDetails && data.playerId === user.id) { // Or if the rejection is about this player
          setShowGuideRequestModal(false)
          setGuideRequestDetails(null)
        }
      }
    }

    const handleGuideChannelEstablished = (data: {
      guideUserId: number;
      guideNickname: string;
      guidedPlayerId: number;
      guidedPlayerNickname: string;
    }) => {
      console.log(user, data.guideUserId, data.guidedPlayerId, (user.id === data.guideUserId || user.id === data.guidedPlayerId))
      if (user && (user.id === data.guideUserId || user.id === data.guidedPlayerId)) {
        setActiveGuideSession({
          partnerNickname: user.id === data.guideUserId ? data.guidedPlayerNickname : data.guideNickname,
          amIGuide: user.id === data.guideUserId,
        })
        // Request resolved, hide modal
        setShowGuideRequestModal(false)
        setGuideRequestDetails(null)
      }
    }

    const handleExternalGuideSessionTerminated = (data: { guideRoomName: string; reason: string; roomId: number }) => {
      if (activeGuideSession) {
        alert(`Session de guide terminée: ${data.reason}`)
        setActiveGuideSession(null)
      }
    }

    const handleBackendError = (data: { message: string }) => {
      if (data.message && data.message.toLowerCase().includes('guide')) {
        alert(`Erreur guide: ${data.message}`)
      } else {
        console.warn('Received non-guide error or generic error:', data.message)
      }
    }

    socket.on('guide:request_received', handleGuideRequestReceived)
    socket.on('guide_request_sent', handleGuideRequestSent)
    socket.on('guide_request_expired', handleGuideRequestExpired)
    socket.on('guide:rejected', handleGuideRequestRejected)
    socket.on('guide:established', handleGuideChannelEstablished)
    socket.on('guide:terminated', handleExternalGuideSessionTerminated)
    socket.on('error', handleBackendError)

    return () => {
      socket.off('guide:request_received', handleGuideRequestReceived)
      socket.off('guide_request_sent', handleGuideRequestSent)
      socket.off('guide_request_expired', handleGuideRequestExpired)
      socket.off('guide:rejected', handleGuideRequestRejected)
      socket.off('guide:established', handleGuideChannelEstablished)
      socket.off('guide:terminated', handleExternalGuideSessionTerminated)
      socket.off('error', handleBackendError)
    }
  }, [socket, gameId, user, showGuideRequestModal, guideRequestDetails, activeGuideSession])

  const handleAcceptGuideRequest = () => {
    if (socket && guideRequestDetails) {
      socket.emit('guide:accept', { guideUserId: guideRequestDetails.guideUserId, gameId: roomData.id })
    }
    setShowGuideRequestModal(false)
    setGuideRequestDetails(null)
  }

  const handleRejectGuideRequest = () => {
    if (socket && guideRequestDetails) {
      socket.emit('guide:rejected', { guideUserId: guideRequestDetails.guideUserId, gameId: roomData.id })
    }
    setShowGuideRequestModal(false)
    setGuideRequestDetails(null)
  }

  useEffect(() => {
    setIsCreator(player?.nickname === creator?.nickname)
  }, [creator])

  useEffect(() => {
    if (viewer && players.find(p => p.guide === viewer.user?.nickname)) {
      const partner = players.find(p => p.guide === viewer.user?.nickname)
      if (!partner) return
      console.log('guideRoomName', `guide_${roomData.id}_${viewer.userId}_${partner.playerId}`)
      setActiveGuideSession({
        partnerNickname: partner.nickname,
        amIGuide: true,
      })
    }

    if (viewers && player?.guide) {
      const partner = viewers.find(v => v.user?.nickname === player.guide)
      if (!partner?.user) return
      console.log('guideRoomName', `guide_${roomData.id}_${partner.userId}_${player.playerId}`)

      setActiveGuideSession({
        partnerNickname: partner.user?.nickname,
        amIGuide: true,
      })
    }
  }, [players, viewer])

  /**
   * Gère l'effacement du chat côté front
   */
  const handleClearChat = () => {
    setMessages([])
  }

  /**
   * Quitter la partie
   */
  const handleLeaveGame = async () => {
    if (!socket || !gameId) return
    if (confirm('Êtes-vous sûr de vouloir quitter la partie ?')) {
      try {
        if (viewer && !viewer.user) {
          if (activeGuideSession) {
            socket.emit('guide:terminated', { roomId: gameId })
          }
          window.location.href = '/'
          return
        }

        if (gameFinished) {
          setGameError('Vous avez bien quitté la partie. Vous pouvez fermer cet onglet.')
          return
        }

        const response = await leaveGame(token)
        if (response.message) {
          if (activeGuideSession) {
            socket.emit('guide:terminated', { roomId: gameId })
          }
        }
        localStorage.removeItem(`game_auth_${gameId}`)
        setGameError('Vous avez bien quitté la partie. Vous pouvez fermer cet onglet.')
      } catch (error) {
        console.error('Erreur lors de la sortie de la partie:', error)
      }
    }
  }

  /**
   * Gérer la lecture/pause de l'audio
   */
  const handleToggleAudio = () => {
    if (!audioTrack) return

    if (audioPlaying) {
      if (audioTrack.type === 'youtube') {
        pause()
      } else {
        audioRef.current?.pause()
      }
    } else {
      if (audioTrack.type === 'youtube') {
        playVideo()
      } else {
        audioRef.current?.play().catch(console.error)
      }
    }
    setAudioPlaying(!audioPlaying)
  }

  /**
   * Gérer le changement de volume
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setAudioVolume(newVolume)

    if (audioTrack?.type === 'youtube') {
      setYTVolume(newVolume)
    } else {
      if (audioRef.current) audioRef.current.volume = newVolume
    }
  }

  const markGameAsBugged = async (isBugged: boolean) => {
    try {
      const res = await axios.post(`/api/admin/games/room/${roomData.id}/markAsBugged`, { isBugged }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.status === 200) {
        toast.success('Partie marquée comme bugged', ToastDefaultOptions)
      } else {
        toast.error('Une erreur est survenue', ToastDefaultOptions)
      }
    } catch {
      toast.error('Une erreur est survenue', ToastDefaultOptions)
    }
  }

  // Créer et gérer l'élément audio
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = audioVolume

    // 2) Dès que la piste se termine, on enlève le player
    const handleEnded = () => {
      setAudioPlaying(false)
      setAudioTrack(null)
    }
    audioRef.current.addEventListener('ended', handleEnded)

    // on ne démarre ici que le flux « src » (MP3/ogg)
    if (audioTrack?.type === 'src' && audioTrack.url) {
      audioRef.current.src = audioTrack.url
      if (audioPlaying) audioRef.current.play().catch(console.error)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current.removeEventListener('ended', handleEnded)
      }
    }
  }, [])

  // Mettre à jour le volume lorsqu'il change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume
    }
  }, [audioVolume])

  // Auto-close winners display after 5 seconds
  useEffect(() => {
    if (winnersAvatars.avatars.length > 0 && canvasReady) {
      const timer = setTimeout(() => {
        setWinnersAvatars({ avatars: [], winMsg: '' })
      }, 6000) // 1.5s delay + 6s display time

      return () => clearTimeout(timer)
    }
  }, [winnersAvatars, canvasReady])

  if (gameError) {
    // Using a unique value ensures the storage event always triggers
    localStorage.setItem('gameFinished', Date.now().toString())

    const isLeaveMessage = gameError.includes('Vous avez bien quitté la partie.')
    return (
      <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black flex items-center justify-center text-white">
        <div className="absolute inset-0 z-0">{staticStars}</div>

        {/* Nébuleuses colorées */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(circle at 70% 30%, rgba(111, 66, 193, 0.6), transparent 60%), radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.6), transparent 60%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 70%)',
            }}
          />
        </div>

        {/* Étoiles avec parallaxe */}
        <div className="absolute inset-0 z-1">{parallaxStars}</div>

        <motion.div
          className={`z-20 bg-black/60 backdrop-blur-md rounded-xl border ${isLeaveMessage ? 'border-green-500/30' : 'border-red-500/30'} p-8 max-w-md text-center`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!isLeaveMessage && <div className="text-red-500 text-5xl mb-4">⚠️</div>}
          <h1 className={`text-2xl font-bold mb-4 ${isLeaveMessage ? 'text-green-400' : 'text-red-400'}`}>
            {isLeaveMessage ? 'Partie quittée' : 'Erreur'}
          </h1>
          <p className="text-gray-300 mb-6">{gameError}</p>
          <button
            onClick={() => window.close()}
            className={`px-4 py-2 ${isLeaveMessage ? 'bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900' : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900'} text-white rounded-lg transition-all`}
          >
            Fermer
          </button>
        </motion.div>
      </div>
    )
  }

  if (passwordRequired && !isAuthorized) {
    return (
      <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black flex items-center justify-center text-white">
        <div className="absolute inset-0 z-0">{staticStars}</div>

        {/* Nébuleuses colorées */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(circle at 70% 30%, rgba(111, 66, 193, 0.6), transparent 60%), radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.6), transparent 60%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3), transparent 70%)',
            }}
          />
        </div>

        {/* Étoiles avec parallaxe */}
        <div className="absolute inset-0 z-1">{parallaxStars}</div>

        <motion.div
          className="bg-black/60 backdrop-blur-md rounded-xl border border-blue-500/30 p-8 max-w-md w-full z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-blue-500 text-5xl mb-4 flex justify-center">🔒</div>
          <h1 className="text-2xl font-bold mb-4 text-center">Partie protégée</h1>
          <p className="text-blue-300 mb-6 text-center">Entrez le mot de passe pour rejoindre la partie.</p>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />

            <motion.button
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePasswordSubmit}
            >
              Valider
            </motion.button>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">{error}</div>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  const options = []
  if (roomData.anonymousGame) {
    options.push('Anonyme')
  }
  if (roomData.whiteFlag) {
    options.push('Sans Points')
  }

  return (
    <>
      {/* Winners Overlay */}
      <AnimatePresence>
        {winnersAvatars.avatars.length > 0 && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background overlay */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => setWinnersAvatars({ avatars: [], winMsg: '' })}
            />

            {/* Close button - top right */}
            <motion.button
              onClick={() => setWinnersAvatars({ avatars: [], winMsg: '' })}
              className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 hover:border-white/40 flex items-center justify-center text-white hover:text-red-400 transition-all duration-200 backdrop-blur-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Fermer (Échap)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Celebration particles */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>

            {/* Main content */}
            <motion.div
              className="relative z-10 text-center w-[70%] mx-auto px-4"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Title */}
              <motion.h3
                className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 mb-8"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                🎉 <span dangerouslySetInnerHTML={{ __html: winnersAvatars.winMsg }} /> 🎉
              </motion.h3>

              {/* Subtitle */}
              <motion.p
                className="text-2xl md:text-3xl text-white mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Félicitations aux gagnants !
              </motion.p>

              {/* 3D Avatars Canvas */}
              <motion.div
                className="w-full h-96 md:h-[500px] rounded-xl overflow-hidden border-4 border-yellow-400/50 shadow-2xl shadow-yellow-400/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                onAnimationComplete={() => setCanvasReady(true)}
              >
                {canvasReady ? (
                  <MultiAvatarCanvas
                    avatars={winnersAvatars.avatars}
                    backgroundColor="#1a1a2e"
                    ctrlMaxDist={winnersAvatars.avatars.length < 3 ? 4 : 8}
                    orbitsControls={false}
                  />
                ) : (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                )}
              </motion.div>

              {/* Countdown */}
              <motion.div
                className="mt-8 text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <p className="text-lg">Cette fenêtre se fermera automatiquement...</p>
              </motion.div>
            </motion.div>

            {/* Auto-close timer */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-64 h-2 bg-gray-700 rounded-full overflow-hidden"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 256 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ delay: 1.5, duration: 6, ease: 'linear' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de déconnexion */}
      <AnimatePresence>
        {showDisconnectionModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-red-900/90 to-red-800/90 backdrop-blur-md rounded-xl border border-red-500/50 p-8 max-w-md w-full mx-4 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Icône d'alerte */}
              <div className="flex justify-center mb-4">
                <motion.div
                  className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Titre */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">Connexion perdue</h2>

              {/* Informations */}
              <div className="text-center mb-6 space-y-2">
                <p className="text-red-200">La connexion avec le serveur a été interrompue</p>
                {disconnectionTime && (
                  <p className="text-red-300 text-sm">Déconnecté à {disconnectionTime.toLocaleTimeString()}</p>
                )}
              </div>

              {/* Barre de progression des tentatives */}
              {isReconnecting && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-red-200">Reconnexion en cours...</span>
                    <span className="text-sm text-red-300">
                      {reconnectAttempts}/{maxReconnectAttempts}
                    </span>
                  </div>
                  <div className="w-full bg-red-900/50 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(reconnectAttempts / maxReconnectAttempts) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="space-y-3">
                {/*<motion.button
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.reload()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Actualiser la page
                </motion.button>*/}

                <motion.button
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleManualReconnect}
                  disabled={isReconnecting}
                >
                  {reconnectAttempts >= maxReconnectAttempts
                    ? 'Plus de tentatives possibles. Réessayer'
                    : isReconnecting
                      ? (
                        <>
                          <motion.svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </motion.svg>
                          Reconnexion…
                        </>
                      )
                      : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                            />
                          </svg>
                          Tenter la reconnexion
                        </>
                      )
                  }
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isAuthorized && creator ? (
        <>
          <Box
            className="game-page"
            display="flex"
            flexDirection="column"
            sx={{
              backgroundImage:
                isNight || gameFinished
                  ? 'url(/assets/images/games/background-night.png)'
                  : 'url(/assets/images/games/background2.png)',
              backgroundSize: 'cover',
            }}
          >
            {/* En-tête */}
            <div className="relative z-10 bg-gradient-to-r from-black/80 to-blue-900/30 backdrop-blur-sm border-b border-blue-500/30 shadow-lg">
              <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                    <span className="font-bold text-lg">P42</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">
                      <span className={gameTypeColors[roomData.type as keyof typeof gameTypeColors]}>
                        [{GAME_TYPES[roomData.type]}]
                      </span>{' '}
                      {roomData.name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-blue-300">
                      <p className="text-sm text-blue-300 flex items-center">
                        {players.length}/{slots} joueurs • {options.length === 0 && ' Aucune'} Options
                        <span className="flex gap-1 ml-1">
                          {roomData.discordChannelId && (
                            <>
                              <Mic size={16} data-tooltip-id={`voice_${roomData.id}`} />
                              <Tooltip id={`voice_${roomData.id}`} content="Partie vocale" />
                            </>
                          )}
                          {roomData.whiteFlag && (
                            <>
                              <Flag size={16} data-tooltip-id={`flag_${roomData.id}`} />
                              <Tooltip id={`flag_${roomData.id}`} content="Sans points" />
                            </>
                          )}
                          {roomData.anonymousGame && (
                            <>
                              <Ghost size={16} data-tooltip-id={`anon_${roomData.id}`} />
                              <Tooltip id={`anon_${roomData.id}`} content="Partie anonyme" />
                            </>
                          )}
                          {roomData.password && (
                            <>
                              <Lock size={16} data-tooltip-id={`private_${roomData.id}`} />
                              <Tooltip id={`private_${roomData.id}`} content="Partie privée" />
                            </>
                          )}
                        </span>
                        • {isNight ? 'Phase nocturne' : 'Phase diurne'}
                      </p>

                      {/* Indicateur de connexion */}
                      <div className="flex items-center gap-1">
                        <motion.div
                          className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
                          animate={!isConnected ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                        />
                        <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                          {isConnected ? 'Connecté' : 'Déconnecté'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {!isArchive ? (
                  <div className="flex gap-2 items-center">
                    {audioTrack && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-blue-500/30 rounded-lg">
                        <motion.button
                          className={`w-6 h-6 flex items-center justify-center rounded-full ${audioPlaying ? 'bg-purple-600' : 'bg-blue-600'} text-white`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleToggleAudio}
                        >
                          {audioPlaying ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </motion.button>
                        <div className="flex flex-col">
                          <span className="text-xs text-white font-medium truncate max-w-[100px]">
                            {audioTrack?.title || '…'}
                          </span>
                          <span className="text-xs text-blue-300 truncate max-w-[100px]">
                            {audioTrack?.artist || '…'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={audioVolume}
                          onChange={handleVolumeChange}
                          className="w-16 h-1 bg-blue-500/30 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                    {isPremium && player &&
                      premiumPanelData && gameStarted && !gameFinished && (
                      <motion.button
                        className={`px-3 py-1 ${showPremiumPanel ? 'bg-purple-900/60' : 'bg-black/40'} hover:bg-purple-900/60 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg transition-all flex items-center gap-1`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowPremiumPanel(!showPremiumPanel)}
                        title="Panel Premium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm2 2a1 1 0 000 2h.01a1 1 0 100-2H5zm3 0a1 1 0 000 2h3a1 1 0 100-2H8z"
                            clipRule="evenodd"
                          />
                        </svg>
                          Panel Premium
                      </motion.button>
                    )}
                    <motion.button
                      className="px-3 py-1 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearChat}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Effacer
                    </motion.button>
                    <motion.button
                      className="px-3 py-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-500/30 rounded-lg transition-all flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLeaveGame}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm9 2.586L14.586 8H12V5.586zM5 5h5v2H5V5zm0 4h10v6H5V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Quitter
                    </motion.button>
                  </div>
                ) : (
                  <>
                    { gameFinished && user && (user.role == 'SuperAdmin' || user.role == 'Admin' || user.role == 'Developer') && (
                      <motion.button
                        className="px-3 py-1 bg-orange-900/40 hover:bg-orange-900/60 text-orange-300 hover:text-white border border-orange-500/30 rounded-lg transition-all flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => markGameAsBugged(true)}
                      >
                        Marquer comme bugged
                      </motion.button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Contenu principal */}
            <Box
              display="flex"
              flex={1}
              p={2}
              className="game-page-container"
              sx={{ flexDirection: { xs: 'column', md: 'row' } }}
            >
              {/* Colonne gauche : Controls */}
              <Box
                display="flex"
                flexDirection="column"
                mr={{ xs: 0, md: 2 }}
                mb={{ xs: 2, md: 0 }}
                sx={{
                  width: { xs: '100%', md: '25%' },
                  height: { xs: 'auto', md: '100%' },
                  flexShrink: 0,
                }}
                className="left-column"
              >
                <Box mb={2}>
                  <Controls
                    gameId={gameId}
                    roomData={roomData}
                    isCreator={isCreator}
                    creator={creator}
                    canBeReady={canBeReady}
                    canStartGame={canStartGame}
                    player={player}
                    players={players}
                    gameStarted={gameStarted}
                    gameFinished={gameFinished}
                    isArchive={isArchive}
                    setGameStarted={setGameStarted}
                    slots={slots}
                    setSlots={setSlots}
                    setRoomData={setRoomData}
                    isInn={isInn}
                    viewer={viewer}
                    setPlayer={setPlayer}
                    activeGuideSession={activeGuideSession}
                  />
                </Box>
              </Box>

              {/* Colonne centrale : Chat */}
              <div
                className="chat-column flex flex-col mr-0 md:mr-2 mb-2 md:mb-0 w-full md:w-1/2 h-[60vh] md:h-[80vh] min-h-[400px] md:min-h-[85vh] flex-shrink-0 overflow-hidden"
              >
                {loading ? (
                  <Container className="loader-container loader-container-two">
                    <div className="spinner-wrapper">
                      <Spinner className="custom-spinner" />
                      <div className="loading-text">Chargement du chat...</div>
                    </div>
                  </Container>
                ) : (
                  <>
                    {/*
                      Si le spectateur est en train de guider (activeGuideSession.amIGuide),
                      on récupère le PlayerType du joueur guidé (par nickname) pour le passer
                      à la prop `player`. Sinon on laisse le vrai `player`.
                    */}
                    {(() => {
                      // Déterminer quel "player" transmettre au Chat
                      let displayPlayer = player
                      if (
                        activeGuideSession?.amIGuide &&
                        activeGuideSession.partnerNickname
                      ) {
                        // On cherche dans la liste des joueurs celui qui a le même nickname
                        const guided = players.find(
                          (pl) => pl.nickname === activeGuideSession.partnerNickname
                        )
                        if (guided) {
                          displayPlayer = guided
                        }
                      }

                      return (
                        <Chat
                          gameId={gameId!}
                          playerId={user?.id}
                          player={displayPlayer ?? undefined}
                          viewer={viewer ?? undefined}
                          players={players}
                          user={user ?? undefined}
                          userRole={user?.role}
                          messages={messages}
                          highlightedPlayers={highlightedPlayers}
                          isNight={isNight}
                          gameStarted={gameStarted}
                          gameFinished={gameFinished}
                          isArchive={isArchive}
                          isInn={isInn}
                          gameType={roomData.type}
                          hasVoice={!!roomData.discordChannelId}
                        />
                      )
                    })()}
                  </>
                )}
              </div>

              {/* Colonne droite : Liste des joueurs */}
              <Box
                display="flex"
                flexDirection="column"
                sx={{
                  width: { xs: '100%', md: '25%' },
                  height: { xs: 'auto', md: '100%' },
                  maxHeight: { xs: '50vh', md: 'none' },
                  overflow: { xs: 'auto', md: 'visible' },
                }}
                className="right-column"
              >
                <Composition roomData={roomData} players={players} />
                <PlayersList
                  players={players}
                  player={player}
                  viewers={viewers}
                  viewer={viewer}
                  isCreator={isCreator}
                  creatorNickname={creator!.nickname}
                  gameId={gameId!}
                  socket={socket}
                  toggleHighlightPlayer={toggleHighlightPlayer}
                  highlightedPlayers={highlightedPlayers}
                  gameStarted={gameStarted}
                  gameFinished={gameFinished}
                  alienList={alienList}
                  sistersList={sistersList}
                  brothersList={brothersList}
                  coupleList={coupleList}
                  isNight={isNight}
                  isInn={isInn}
                  innList={innList}
                  hasVoice={!!roomData.discordChannelId}
                  isReplay={false}
                />
              </Box>
            </Box>
          </Box>

          <div className="relative z-10 bg-gradient-to-r from-black/80 to-blue-900/30 backdrop-blur-sm border-t border-blue-500/30 py-2 px-4 text-xs text-blue-300">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                {!isArchive ? 'Partie' : 'Archive'} #{gameId} • v{process.env.REACT_APP_GAME_VERSION}
              </div>
              {player && (
                <div>
                  Connecté en tant que: <span className="text-white font-medium">{player.nickname}</span>
                </div>
              )}
            </div>
          </div>

          {guideRequestDetails && (
            <GuideRequestModal
              show={showGuideRequestModal}
              guideNickname={guideRequestDetails.guideNickname}
              onAccept={handleAcceptGuideRequest}
              onReject={handleRejectGuideRequest}
              onClose={() => { setShowGuideRequestModal(false); setGuideRequestDetails(null) }} // Simple close action
            />
          )}
          {activeGuideSession && user && (
            <GuideChat
              roomId={roomData.id}
              partnerNickname={activeGuideSession.partnerNickname}
              amIGuide={activeGuideSession.amIGuide}
              onSessionTerminated={() => {
                setActiveGuideSession(null)
              }}
            />
          )}

          <DevCommandsPanel socket={socket} gameId={gameId!} isVisible={!isArchive} />
          <ParameterCommandsPanel socket={socket} gameId={Number(gameId)!} isVisible={!isArchive} />
        </>
      ) : (
        <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black flex items-center justify-center text-white">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-4 text-blue-300">Chargement de la partie...</p>
          </div>
        </div>
      )}

      {showPremiumPanel && premiumPanelData && (
        <AnimatePresence>
          <motion.div
            className="fixed bottom-4 right-4 z-40 w-96 max-w-[calc(100vw-2rem)]"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="relative">
              <PremiumPanel data={premiumPanelData} />
              {/* Close button */}
              <motion.button
                onClick={() => setShowPremiumPanel(false)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center text-xs shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Fermer"
              >
                  ×
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {showBugReportModal && (
        <BugReportModal
          isOpen={showBugReportModal}
          onClose={() => setShowBugReportModal(false)}
          gameId={gameId}
          userId={user?.id}
          username={player?.nickname || viewer?.user?.nickname || 'Anonyme'}
        />
      )}

      {thrownItems.map((ti) => (
        <ThrownItem key={ti.id} src={ti.image} onComplete={() => removeThrownItem(ti.id)} />
      ))}
    </>
  )
}

export default GamePage
