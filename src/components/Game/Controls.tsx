'use client'

import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { usePermissions } from 'hooks/usePermissions'
import {
  addBotToGame,
  startGame,
  addFavoriteGame, leaveGame
} from 'services/gameService'
import { useAuth } from 'contexts/AuthContext'
import { useUser } from 'contexts/UserContext'
import GameTimer from './Timer'
import PhaseAction from './PhaseAction'
import type { RoomData, Viewer } from 'hooks/useGame'
import EditCompoModal from 'components/Game/EditComposition'
import TransferLeadModal from 'components/Game/TransferLead'
import axios from 'axios'
import CardImage from 'components/Game/CardImage'
import Invitations from './Invitations'
import { useSocket } from 'contexts/SocketContext'
import { Tooltip } from 'react-tooltip'
import { toast } from 'react-toastify'
import { ToastDefaultOptions } from 'utils/toastOptions'
import { Player } from 'types/room'
import QuickEndPhaseVote from './QuickEndPhaseVote'

interface GameControlsProps {
  gameId: string | undefined
  roomData: RoomData
  creator: Player
  player: Player | null
  players: Player[]
  viewer: Viewer | null
  isCreator: boolean
  canBeReady: boolean
  canStartGame: boolean
  gameStarted: boolean
  gameFinished: boolean
  setGameStarted: (gameStarted: boolean) => void
  slots: number
  isArchive: boolean
  setSlots: React.Dispatch<React.SetStateAction<number>>
  setRoomData: React.Dispatch<React.SetStateAction<RoomData>>
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>
  isInn: boolean
  activeGuideSession: {
    partnerNickname: string;
    amIGuide: boolean;
  } | null
}

/**
 * Contrôles du salon
 */
const GameControls: React.FC<GameControlsProps> = ({
  isCreator,
  roomData,
  gameId,
  canBeReady,
  canStartGame,
  creator,
  player,
  players,
  viewer,
  gameStarted,
  gameFinished,
  setGameStarted,
  slots,
  setSlots,
  isArchive,
  isInn,
  activeGuideSession,
}) => {
  const { token } = useAuth()
  const { user } = useUser()
  const { socket } = useSocket()
  const { checkPermission } = usePermissions()
  const canAddBot = checkPermission('godPowers', 'addBot')
  const [timer, setTimer] = useState<number>(roomData.timer)
  const [isEditCompositionOpen, setIsEditCompositionOpen] = useState(false)
  const [isTransferLeadOpen, setIsTransferLeadOpen] = useState(false)
  const [isFavoriteArchive, setIsFavoriteArchive] = useState<boolean>(false)
  const [favoriteComment, setFavoriteComment] = useState<string>('')
  const [replayGameId, setReplayGameId] = useState<number | null>(null)
  const [isSavingComment, setIsSavingComment] = useState<boolean>(false)
  const [isLeaving, setIsLeaving] = useState<boolean>(false)
  const [voicePlayers, setVoicePlayers] = useState<number[]>([])
  const [spectatorsAreMuted, setSpectatorsAreMuted] = useState<boolean>(false)
  const [quickEndPhase, setQuickEndPhase] = useState<{ votes: number; required: number; hasVoted: boolean } | null>(null)

  const openEditComposition = () => {
    if (!isCreator || isArchive || roomData.type === 3) return
    setIsEditCompositionOpen(true)
  }
  const closeEditComposition = async () => {
    if (!isCreator || isArchive) return
    if (roomData.maxPlayers !== slots) {
      socket.emit('lobby:update_max_players', { roomId: gameId, maxPlayers: slots })
    }

    socket.emit('lobby:update_cards', { roomId: gameId, cards: roomData.cards })

    setIsEditCompositionOpen(false)
  }

  const handleMuteSpectators = async () => {
    if (!gameId || !isCreator || gameStarted || gameFinished) return
    try {
      const newMuteState = !spectatorsAreMuted
      await axios.put(
        `/api/games/room/${gameId}/muteSpectators`,
        { muteSpectators: newMuteState },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setSpectatorsAreMuted(newMuteState)
      toast.success(newMuteState ? 'Spectateurs mutés' : 'Spectateurs démutés', ToastDefaultOptions)
    } catch (error) {
      console.error('Erreur lors du mute des spectateurs:', error)
      toast.error('Erreur lors du changement du statut des spectateurs', ToastDefaultOptions)
    }
  }

  useEffect(() => {
    if (!socket || !token || !gameFinished) return

    const getFavorite = async () => {
      const response = await axios.post(`/api/games/favorite/${gameId}/get`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.favorite) {
        setIsFavoriteArchive(true)
        setFavoriteComment(response.data.favorite.comment)
      }
    }

    getFavorite()
  }, [])

  useEffect(() => {
    if (!socket) return

    const onReplayed = ({ newGameId, creator }: { newGameId: number; creator: string }) => {
      setReplayGameId(newGameId)
      new Audio('/assets/sounds/rewind.wav').play().catch(() => {})
    }

    socket.on('lobby:replayed', onReplayed)
    return () => {
      socket.off('lobby:replayed', ({ newGameId }) => setReplayGameId(newGameId))
    }
  }, [socket])

  const handleReplay = async () => {
    if (!roomData.id || !gameFinished || !token) return
    try {
      const response = await axios.post(
        `/api/games/room/${roomData.id}/replay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const newGame = response.data.game

      await axios.post(
        `/api/games/room/${newGame.id}/join`,
        { creator: newGame.creator },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setReplayGameId(newGame.id)
      window.location.href = `/game/${newGame.id}`
    } catch (e: any) {
      console.error('Erreur lors du relancement :', e)
      alert(e.response?.data?.error || 'Erreur lors du relancement de la partie')
    }
  }

  const handleJoinSpectate = async () => {
    if (gameId && player && !gameStarted && !gameFinished && !isLeaving) {
      setIsLeaving(true)
      try {
        const response = await leaveGame(token)
        if (response.message) {
          if (activeGuideSession) {
            socket.emit('guide:terminated', { roomId: gameId })
          }
          await axios.post(
            `/api/games/room/${gameId}/spectate`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          setIsLeaving(false)
          window.location.href = `/game/${gameId}`
        }
        setIsLeaving(false)
      } catch (error: any) {
        setIsLeaving(false)
        if (error.response?.data?.error) {
          toast.error(`Une erreur est survenue: ${error.response.data.error}`, ToastDefaultOptions)
        } else {
          toast.error('Erreur lors de la tentative de rejoindre la partie.', ToastDefaultOptions)
        }
      }
    }
  }

  const handleJoinReplayed = async () => {
    if (replayGameId) {
      try {
        if (player) {
          await axios.post(
            `/api/games/room/${replayGameId}/join`,
            { replayFrom: gameId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
        }

        window.location.href = `/game/${replayGameId}`
      } catch (error: any) {
        if (error.response?.data?.error) {
          toast.error(`Une erreur est survenue: ${error.response.data.error}`, ToastDefaultOptions)
        } else {
          toast.error('Erreur lors de la tentative de rejoindre la partie.', ToastDefaultOptions)
        }
      }
    }
  }

  const handleAddBot = async () => {
    if (!gameId || gameStarted || gameFinished) return
    try {
      if (!canAddBot) {
        throw new Error('Vous n\'avez pas la permission d\'ajouter un bot')
      }
      await addBotToGame(gameId, token)
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bot:', error)
    }
  }

  const handleStartGame = async () => {
    if (!gameId || gameStarted || gameFinished || !canStartGame || !token) return
    try {
      await startGame(gameId, token)
      setGameStarted(true)
    } catch (error) {
      alert(error)
    }
  }

  const handleAddFavorite = async () => {
    if (!gameId || !gameFinished) return
    try {
      await addFavoriteGame(gameId, isFavoriteArchive ? 'delete' : 'add', favoriteComment, token)
      if (isFavoriteArchive) {
        toast.info('Partie retirée des favoris.', ToastDefaultOptions)
      } else {
        toast.success('Partie enregistrée !', ToastDefaultOptions)
      }
      setIsFavoriteArchive(!isFavoriteArchive)
    } catch (error) {
      alert(error)
    }
  }

  const handleBeReady = async () => {
    if (!gameId || !player || !canBeReady || gameStarted || gameFinished) return
    try {
      socket.emit('lobby:ready', { roomId: gameId })
    } catch (error) {
      console.error('Erreur lors du set ready:', error)
    }
  }

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const removePlace = () => {
    if (!gameId || gameStarted || gameFinished || slots <= 6 || roomData.type === 3) return

    setSlots((prevSlots) => prevSlots - 1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        socket.emit('lobby:update_max_players', { roomId: gameId, maxPlayers: slots - 1 })
      } catch (error) {
        console.error('Erreur lors du set updateMaxPlayers:', error)
        setSlots((prevSlots) => prevSlots + 1)
        if (axios.isAxiosError(error)) {
          alert(error.response?.data.error)
        }
      }
    }, 750)
  }

  const addPlace = () => {
    if (!gameId || gameStarted || gameFinished || slots >= 24 || roomData.type === 3) return

    setSlots((prevSlots) => prevSlots + 1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        socket.emit('lobby:update_max_players', { roomId: gameId, maxPlayers: slots + 1 })
      } catch (error) {
        console.error('Erreur lors du set updateMaxPlayers:', error)
        setSlots((prevSlots) => prevSlots - 1)
      }
    }, 750)
  }

  const removeTimer = () => {
    if (!gameId || !isCreator || gameStarted || gameFinished || timer <= 2 || roomData.type === 3) return

    setTimer((prevTimer) => prevTimer - 1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      socket.emit('lobby:update_timer_limit', { roomId: gameId, timer: timer -1 })
    }, 750)
  }

  const addTimer = () => {
    if (!gameId || !isCreator || gameStarted || gameFinished || timer >= 5 || roomData.type === 3) return

    setTimer((prevTimer) => prevTimer + 1)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      socket.emit('lobby:update_timer_limit', { roomId: gameId, timer: timer + 1 })
    }, 750)
  }

  const handleTransferCreator = async () => {
    if (!gameId || gameStarted || gameFinished) return
    try {
      setIsTransferLeadOpen(true)
    } catch (error) {
      console.error('Erreur lors du transfert des droits de créateur:', error)
    }
  }

  const handleJoinGame = async () => {
    if (!gameId || gameStarted || gameFinished || players.length >= roomData.maxPlayers || !viewer) return
    try {
      const response = await axios.post(
        `/api/games/room/${gameId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (activeGuideSession) {
        socket.emit('guide:terminated', { roomId: gameId })
      }
      window.location.href = `/game/${response.data.roomId}`
    } catch (error) {
      console.error('Erreur lors du join room:', error)
    }
  }

  const closeTransferLead = async () => {
    setIsTransferLeadOpen(false)
  }

  const getGameDuration = () => {
    if (!roomData) return

    const start = new Date(roomData.createdAt).getTime()
    const end = new Date(roomData.updatedAt).getTime()

    if (isNaN(start) || isNaN(end)) return 'Durée invalide'

    const diffMs = end - start

    if (diffMs <= 0) return 'Durée invalide'

    const minutes = Math.floor(diffMs / 60000)
    const seconds = Math.floor((diffMs % 60000) / 1000)

    return `${minutes} min ${seconds} sec`
  }

  const handleBipNotReadyPlayers = () => {
    if (!socket || !gameId || gameStarted || gameFinished || !isCreator) return

    socket.emit('lobby:bip_not_ready_players', { gameId })
  }

  const handleVoteQuickEnd = () => {
    if (!socket || !gameId || !player?.alive) return
    socket.emit('vote:end_phase', { gameId, vote: true })
    setQuickEndPhase(prev => prev ? { ...prev, hasVoted: true } : prev)
  }

  const isInVoice = player ? voicePlayers.includes(player.playerId) : false

  // Enregistrer automatiquement le commentaire après 3 secondes d'inactivité
  useEffect(() => {
    if (!isFavoriteArchive) return

    const timer = setTimeout(() => {
      if (favoriteComment && favoriteComment.trim() !== '') {
        setIsSavingComment(true)
        addFavoriteGame(gameId!, 'add', favoriteComment, token)
          .then(() => {
            toast.success('Commentaire enregistré', ToastDefaultOptions)
          })
          .catch((error) => {
            console.error('Erreur lors de l\'enregistrement du commentaire:', error)
            toast.error('Erreur lors de l\'enregistrement du commentaire', ToastDefaultOptions)
          })
          .finally(() => {
            setIsSavingComment(false)
          })
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [favoriteComment, isFavoriteArchive, gameId, token])

  // Suivre la présence des joueurs dans le salon vocal
  useEffect(() => {
    if (!roomData.discordChannelId || !socket) return

    const handleVoiceStatus = (playersInVoice: Player[]) => {
      setVoicePlayers(playersInVoice.map((p) => p.playerId))
    }

    socket.on('voiceStatus', handleVoiceStatus)

    return () => {
      socket.off('voiceStatus', handleVoiceStatus)
    }
  }, [roomData.discordChannelId, socket])

  useEffect(() => {
    if (!socket || !players || !player?.alive || gameFinished) return

    const clearQuickEnd = () => setQuickEndPhase(null)

    socket.on('vote:propose_end_phase', () => {
      setQuickEndPhase(prev => {
        if (prev === null) {
          return {
            votes: 0,
            required: players.filter(p => p.alive).length,
            hasVoted: false,
          }
        }
        return prev
      })
    })

    socket.on('vote:end_phase_update', (data) => {
      setQuickEndPhase(prev => {
        if (prev === null) {
          return {
            votes: Object.values(data.votes).filter(v => v).length,
            required: data.required,
            hasVoted: Boolean(data.votes[player?.id ?? '']),
          }
        }
        return {
          votes: Object.values(data.votes).filter(v => v).length,
          required: data.required,
          hasVoted: prev.hasVoted ?? Boolean(data.votes[player?.id ?? '']),
        }
      })
    })
    socket.on('phase:change', clearQuickEnd)

    return () => {
      socket.off('vote:propose_end_phase')
      socket.off('vote:end_phase_update')
      socket.off('phase:change', clearQuickEnd)
    }
  }, [socket, players])

  // Rendu conditionnel selon l'état du jeu
  if (player && !gameStarted && !gameFinished) {
    return (
      <div className="space-y-4">
        {/* Bloc d'invitation */}
        <Invitations gameId={gameId} players={players} isCreator={isCreator} />

        {/* Options pour les joueurs non créateurs */}
        {!isCreator && (
          <motion.div
            className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
              <h3 className="text-lg font-bold text-white">Options de la partie</h3>
            </div>

            <div className="p-4 text-center">
              { player && !gameStarted && !gameFinished && (
                <motion.button
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-lg mb-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoinSpectate}
                >
                  Rejoindre en tant que spectateur
                </motion.button>
              )}
              {player && canBeReady && !player.ready ? (
                <motion.button
                  className="sound-tick px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-lg shadow-lg shadow-green-500/20 animate-pulse"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBeReady}
                >
                  Je suis prêt{user?.isMale ? '' : 'e'} !
                </motion.button>
              ) : player && player.ready ? (
                <div className="bg-gradient-to-r from-black/60 to-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400 font-medium">Tu es prêt{user?.isMale ? '' : 'e'} !</span>
                  </div>

                  {/* Progression des joueurs prêts */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-300">Joueurs prêts</span>
                      <span className="text-white font-medium">
                        {players.filter((p) => p.ready).length + 1}/{players.length}
                      </span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-700 h-2.5 rounded-full"
                        style={{ width: `${((players.filter((p) => p.ready).length + 1) / players.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Message d'attente */}
                  <div className="text-center">
                    {players.length < 6 ? (
                      <p className="text-yellow-300">
                        <span className="inline-block animate-pulse mr-1">⚠️</span>
                        Il faut au moins 6 joueurs pour commencer
                      </p>
                    ) : players.filter((p) => !p.ready).length - 1 > 0 ? (
                      <p className="text-blue-300">
                        En attente de {players.filter((p) => !p.ready).length - 1} joueur
                        {players.filter((p) => !p.ready).length - 1 > 1 ? 's' : ''}
                      </p>
                    ) : (
                      <p className="text-green-400">
                        <span className="inline-block animate-pulse mr-1">✓</span>
                        Tous les joueurs sont prêts !
                      </p>
                    )}
                    <p className="text-gray-400 text-sm mt-1">En attente du lancement par le créateur</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-black/60 to-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-yellow-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span className="text-yellow-400 font-medium">En attente de joueurs</span>
                  </div>

                  {/* Progression des joueurs */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-300">Joueurs connectés</span>
                      <span className="text-white font-medium">
                        {players.length}/{slots}
                      </span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-yellow-700 h-2.5 rounded-full"
                        style={{ width: `${Math.min((players.length / slots) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Message d'attente */}
                  <div className="text-center">
                    <p className="text-yellow-300">
                      <span className="inline-block animate-pulse mr-1">⚠️</span>
                      Il manque {Math.max(slots - players.length, 0)} joueur
                      {Math.max(slots - players.length, 0) > 1 ? 's' : ''} pour commencer
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Cliquez sur "Je suis prêt" quand suffisamment de joueurs seront connectés
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Options pour le créateur */}
        {isCreator && (
          <motion.div
            className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
              <h3 className="text-lg font-bold text-white">Configurer la partie</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Nombre de places */}
              <div className="flex items-center justify-center space-x-2">
                {roomData.type !== 3 && (
                  <button
                    className="sound-tick w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-blue-300 hover:text-white hover:bg-black/60 transition-colors"
                    onClick={removePlace}
                    disabled={slots <= 6}
                  >
                    –
                  </button>
                )}
                <div className="px-4 py-2 bg-black/40 rounded-lg text-white">
                  <span className="font-bold">{slots}</span> places
                </div>
                {roomData.type !== 3 && (
                  <button
                    className="sound-tick w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-blue-300 hover:text-white hover:bg-black/60 transition-colors"
                    onClick={addPlace}
                    disabled={slots >= 24}
                  >
                    +
                  </button>
                )}
              </div>

              {/* Temps de débat */}
              <div className="flex items-center justify-center space-x-2">
                {roomData.type !== 3 && (
                  <button
                    className="sound-tick w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-blue-300 hover:text-white hover:bg-black/60 transition-colors"
                    onClick={removeTimer}
                    disabled={timer <= 2}
                  >
                    –
                  </button>
                )}
                <div className="px-4 py-2 bg-black/40 rounded-lg text-white">
                  <span className="font-bold">{timer}</span> min de débat
                </div>
                {roomData.type !== 3 && (
                  <button
                    className="sound-tick w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-blue-300 hover:text-white hover:bg-black/60 transition-colors"
                    onClick={addTimer}
                    disabled={timer >= 5}
                  >
                    +
                  </button>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="space-y-2">
                <motion.button
                  className={`w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 ${roomData.type === 3 ? 'disabled cursor-not-allowed' : 'sound-ticket'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openEditComposition}
                  disabled={roomData.type === 3}
                  data-tooltip-content={
                    roomData.type === 3
                      ? 'Vous ne pouvez pas modifier la composition dans une partie carnage.'
                      : 'Modifier la composition de jeu'
                  }
                  data-tooltip-id="compo-edit"
                >
                  Gérer la composition
                </motion.button>
                <Tooltip id="compo-edit" />
                <motion.button
                  className="sound-tick w-full px-4 py-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleTransferCreator}
                >
                  Léguer les droits du salon
                </motion.button>

                {user?.role && canAddBot && (
                  <motion.button
                    className="sound-tick w-full px-4 py-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddBot}
                  >
                    Ajouter un bot
                  </motion.button>
                )}

                <motion.button
                  className="sound-tick w-full px-4 py-2 bg-black/40 hover:bg-black/60 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMuteSpectators}
                  data-tooltip-id="mute-spectators"
                  data-tooltip-content={spectatorsAreMuted ? 'Démuter les spectateurs' : 'Muter les spectateurs'}
                >
                  {spectatorsAreMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793A1 1 0 019.383 3.076zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793A1 1 0 019.383 3.076zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.414A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </motion.button>
                <Tooltip id="mute-spectators" />

                {/* Bouton pour bipper les joueurs non prêts - visible uniquement quand le salon est plein */}
                {players.length === slots &&
                  players.filter((p) => p.nickname !== creator.nickname).some((p) => !p.ready) && (
                  <motion.button
                    className="sound-tick w-full px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg shadow-orange-500/20 animate-pulse"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBipNotReadyPlayers}
                  >
                      Bipper les joueurs non prêts ({players.filter((p) => !p.ready).length - 1})
                  </motion.button>
                )}

                {isEditCompositionOpen && <EditCompoModal roomId={roomData.id} roomType={roomData.type} onClose={closeEditComposition} />}
                {isTransferLeadOpen && (
                  <TransferLeadModal
                    roomId={roomData.id}
                    players={players}
                    creator={roomData.creator}
                    onClose={closeTransferLead}
                  />
                )}
              </div>

              {roomData.discordChannelId !== null && (
                <motion.button
                  className={`sound-tick w-full px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition-all ${isInVoice ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={isInVoice ? {} : { scale: 1.02 }}
                  whileTap={isInVoice ? {} : { scale: 0.98 }}
                  onClick={() => {
                    if (!isInVoice) {
                      window.open(`https://discord.com/channels/${roomData.discordChannelId}`, '_blank')
                    }
                  }}
                  disabled={isInVoice}
                >
                  Rejoindre le salon Discord
                </motion.button>
              )}

              {/* Bouton de lancement */}
              <motion.button
                className={`sound-tick w-full px-6 py-3 bg-gradient-to-r ${
                  canStartGame
                    ? 'from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 animate-pulse'
                    : 'from-gray-600 to-gray-800 opacity-70 cursor-not-allowed'
                } text-white rounded-lg shadow-lg shadow-green-500/20 transition-all`}
                whileHover={canStartGame ? { scale: 1.05 } : {}}
                whileTap={canStartGame ? { scale: 0.95 } : {}}
                onClick={handleStartGame}
                disabled={!canStartGame}
              >
                <span className="text-lg font-bold">Lancer la partie</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  // Partie en cours
  if (player && gameStarted && !gameFinished) {
    return (
      <div className="space-y-4">
        <motion.div
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
            <h3 className="text-lg font-bold text-white">Informations</h3>
          </div>

          <div className="p-4">
            <div className="bg-black/40 rounded-lg p-3 mb-4">
              <p className="text-center text-blue-200 mb-2">
                Vous êtes <span className="strong font-bold">{player.card?.name}</span>
              </p>

              {/* Carte du joueur */}
              <div className="flex justify-center mb-4 relative h-32">
                <CardImage cardId={player.cardId} card={player.card} isArchive={isArchive} />
              </div>
            </div>

            {/* Timer */}
            <GameTimer gameId={gameId || ''} gameStarted={gameStarted} gameFinished={gameFinished} />

            {gameStarted && !player?.alive ? (
              <div className="bg-black/40 rounded-lg p-3 mb-4">
                <p className="text-center text-blue-200 mb-2">
                  Vous êtes <span className="strong font-bold">mort.</span>
                </p>

                {player.card?.id === 6 && (
                  <PhaseAction player={player} roomId={Number(gameId!)} gameType={roomData.type} isInn={isInn} />
                )}
              </div>
            ) : (
              <PhaseAction player={player} roomId={Number(gameId!)} gameType={roomData.type} isInn={isInn} />
            )}

            {quickEndPhase && (
              <QuickEndPhaseVote
                votes={quickEndPhase.votes}
                required={quickEndPhase.required}
                hasVoted={quickEndPhase.hasVoted}
                onVote={handleVoteQuickEnd}
              />
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  if ((!player || viewer) && !gameFinished) {
    return (
      <div className="space-y-4">
        <motion.div
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
            <h3 className="text-lg font-bold text-white">Informations</h3>
          </div>

          <div className="p-4">
            <div className="bg-black/40 rounded-lg p-3 mb-4">
              <p className="text-center text-blue-200 mb-2">
                Vous êtes <span className="strong font-bold">spectateur</span>
              </p>
            </div>

            {viewer?.user && !gameStarted && !gameFinished && (
              <motion.button
                className={`sound-tick w-full px-4 py-2 transition-all rounded-lg ${
                  players.length >= slots || (roomData.discordChannelId && !user?.discordId)
                    ? 'bg-red-900/20 text-red-300 border border-red-500/30 opacity-70 cursor-not-allowed'
                    : 'bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 hover:text-white border border-blue-500/30'
                }`}
                whileHover={players.length >= slots || (roomData.discordChannelId && !user?.discordId) ? {} : { scale: 1.02 }}
                whileTap={players.length >= slots || (roomData.discordChannelId && !user?.discordId) ? {} : { scale: 0.98 }}
                onClick={handleJoinGame}
                disabled={players.length >= slots || (!!roomData.discordChannelId && !user?.discordId)}
                data-tooltip-id="join_game"
                data-tooltip-content={
                  players.length >= slots
                    ? 'Vous ne pouvez pas rejoindre, la partie est pleine.'
                    : roomData.discordChannelId && !user?.discordId
                      ? 'Liez votre compte Discord pour rejoindre une partie vocale'
                      : 'Rejoindre le salon de jeu'
                }
              >
                Rejoindre la partie
                <Tooltip id="join_game" />
              </motion.button>
            )}

            {/* Timer */}
            {gameStarted && <GameTimer gameId={gameId || ''} gameStarted={gameStarted} gameFinished={gameFinished} />}

            {quickEndPhase && (
              <QuickEndPhaseVote
                votes={quickEndPhase.votes}
                required={quickEndPhase.required}
                hasVoted={quickEndPhase.hasVoted}
                onVote={handleVoteQuickEnd}
              />
            )}

            {!viewer?.user && !gameFinished && (
              <motion.div
                className="w-full p-4 bg-black/60 backdrop-blur-sm border border-blue-500/30 rounded-lg shadow-lg shadow-blue-500/10 flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <img src="/assets/images/carte0.png" alt="Logo du jeu" className="h-16 w-auto object-contain mb-1" />
                <p className="text-sm text-blue-200 italic text-center">
                  Rejoins la communauté pour lancer tes propres parties et découvrir un univers de jeu passionnant où
                  stratégie et persuasion seront tes meilleurs atouts !
                </p>
                <motion.button
                  className="sound-tick w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all shadow-md shadow-blue-500/20"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Créer mon compte
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  // Partie terminée (archive)
  if (isArchive || gameFinished) {
    const cardId = 1
    const winStates: Record<number, string> = {
      90: 'Les <b>Aliens infiltrés</b> ont gagné !',
      91: 'Les <b>Membres de la station</b> ont gagné !',
      92: 'Les <b>Amoureux</b> ont gagné !',
      93: 'L\'<b>Alien Solitaire</b> a gagné !',
      94: 'Le <b>Maître des Ondes</b> a gagné !',
      95: 'Le <b>Séraphin</b> a gagné !',
      96: 'Le <b>Séraphin</b> a gagné !',
      99: 'Tout le monde est mort !',
    }

    const cardsIds: Record<number, number> = {
      90: 2,
      91: 1,
      92: 6,
      93: 9,
      94: 15,
      95: 19,
      96: 19,
      99: 0,
    }

    return (
      <div className="space-y-4">
        <motion.div
          className="bg-gradient-to-r from-black/60 to-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-3 border-b border-blue-500/30">
            <h3 className="text-lg font-bold text-white">
              Archive de la partie {roomData.name.replace('Partie de', ' de')}
            </h3>
          </div>

          <div className="p-4">
            <CardImage cardId={cardsIds[roomData.phase] ?? cardId} isArchive={true} />
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 mb-4">
              <div className="flex-1">
                <h3
                  className="text-xl font-bold mb-2 text-white"
                  dangerouslySetInnerHTML={{ __html: winStates[roomData.phase] || 'Partie terminée' }}
                />
                <p className="text-blue-300">
                  <span className="font-bold">Durée de la partie:</span> {getGameDuration()}
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              <motion.button
                className={`w-full px-4 py-2 flex items-center justify-center gap-2 sound-tick ${
                  !isFavoriteArchive
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
                    : 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900'
                } text-white rounded-lg transition-all shadow-lg`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddFavorite}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                {!isFavoriteArchive ? 'Ajouter à mes favoris' : 'Retirer de mes favoris'}
              </motion.button>

              <motion.button
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = `/game/${gameId}/replay`}
              >
                Voir le replay
              </motion.button>

              {isFavoriteArchive && (
                <div className="bg-black/40 rounded-lg p-3 relative">
                  <textarea
                    value={favoriteComment}
                    onChange={(e) => setFavoriteComment(e.target.value)}
                    placeholder="Un commentaire sur cette partie ? 😊"
                    className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    rows={4}
                  />
                  {isSavingComment && (
                    <div className="absolute top-2 right-2 text-xs text-blue-300 flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-300"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Enregistrement...
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    Le commentaire sera enregistré automatiquement 1 seconde après avoir arrêté de taper.
                  </div>
                </div>
              )}

              {/* Replay controls for creator */}
              {isCreator && !replayGameId && (
                <motion.button
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReplay}
                >
                  Relancer la partie
                </motion.button>
              )}

              {replayGameId && (
                <motion.button
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoinReplayed}
                >
                  Rejoindre la nouvelle partie
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}

export default GameControls
