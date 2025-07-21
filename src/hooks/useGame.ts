import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import {
  fetchGameDetails,
} from '../services/gameService'
import axios from 'axios'
import { Player } from 'types/room'
import { AvatarConfig } from 'components/Avatar/MultiScene'
import { PremiumPlayerStats } from 'types/premium'

export interface Message {
  nickname: string
  message: string
  playerId: number
  channel: number
  icon: string | null
  sound: string | null
  isMeneur: boolean
  isPerso: boolean
  isMsgSite: boolean
  cssClass?: string | null
  toPlayer?: number | null
  createdAt: Date
}

export interface UserType {
  id: number
  nickname: string
  realNickname: string
  ready: boolean
  alive: boolean
  card?: { id: number; name: string; description: string; }
  inLove: boolean
  isSister: boolean
  isBrother: boolean
  isCharmed: boolean
  isInfected: boolean
  canVote?: boolean
}

export interface Viewer {
  id: string
  roomId: string
  userId: string
  user?: UserType
  ip: string
}

export interface Card {
  id: number
  name: string
  description: string
  disabled: boolean
}

export interface RoomCard {
  id: number
  roomId: number
  cardId: number
  quantity: number
  card: Card
}

export interface RoomData {
  id: number
  creator: string
  name: string
  status: 'waiting' | 'in_progress' | 'completed'
  type: number
  timer: number
  maxPlayers: number
  isPrivate: boolean
  password?: string
  discordChannelId?: string | null
  phase: number
  whiteFlag: boolean
  anonymousGame: boolean
  cards: RoomCard[]
  players?: Partial<Player>[]
  createdAt: Date
  updatedAt: Date
}

function isDateMoreThan10MinutesOld(date: Date) {
  const tenMinutesAgo = Date.now() - 600000
  return new Date(date).getTime() < tenMinutesAgo
}

/**
 * Hook gérant toute la logique d'une page Game
 */
export const useGame = (
  gameId: string | undefined,
  user: any, // fix type
  token: string | null,
  socket: Socket | null
) => {
  const [roomData, setRoomData] = useState<RoomData>({
    id: 0,
    creator: '',
    name: 'Chargement...',
    timer: 3,
    status: 'waiting',
    type: 0,
    maxPlayers: 6,
    isPrivate: true,
    discordChannelId: null,
    cards: [],
    phase: 0,
    whiteFlag: false,
    anonymousGame: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [password, setPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [player, setPlayer] = useState<Player | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [winnersAvatars, setWinnersAvatars] = useState<{ winMsg: string, avatars: AvatarConfig[]}>({ winMsg: '', avatars: [] })
  const [viewer, setViewer] = useState<Viewer | null>(null)
  const [viewers, setViewers] = useState<Viewer[]>([])
  const [creator, setCreator] = useState<Player | null>(null)
  const [isCreator, setIsCreator] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [canBeReady, setCanBeReady] = useState(false)
  const [canStartGame, setCanStartGame] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [gameError, setGameError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNight, setIsNight] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [alienList, setAlienList] = useState<string[]>([])
  const [sistersList, setSisterList] = useState<string[]>([])
  const [brothersList, setBrothersList] = useState<string[]>([])
  const [coupleList, setCoupleList] = useState<string[]>([])
  const [slots, setSlots] = useState<number>(roomData.maxPlayers)
  const [isArchive, setIsArchive] = useState<boolean>(false)
  const [isInn, setIsInn] = useState<boolean>(false)
  const [innList, setInnList] = useState<string[]>([])
  const [premiumPanelData, setPremiumPanelData] = useState<PremiumPlayerStats[]>([])

  /**
   * Asynchronously handles the submission of a password for game authentication.
   * Sends an HTTP POST request to validate the password associated with a specific game.
   * If the validation is successful, updates the authorization state and local storage.
   * If the validation fails, displays an incorrect password alert.
   * In case of any errors during the request, displays an error alert.
   *
   * The function performs the following steps:
   * - Sends a POST request to the server with the game ID and password.
   * - If the response indicates success, stores authorization status in localStorage and updates the state.
   * - If the validation fails (e.g., wrong password), alerts the user about the issue.
   * - Handles errors gracefully by alerting the user about a validation error.
   */
  const handlePasswordSubmit = async () => {
    try {
      const response = await axios.post('/api/games/validate-password', {
        gameId,
        password,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        localStorage.setItem(`game_auth_${gameId}`, 'true')
        setIsAuthorized(true)
        setPasswordRequired(false)
      } else {
        setError('Mot de passe incorrect')
      }
    } catch (error: any) {
      if (error.response.data.error) {
        setError(error.response.data.error)
      } else setError('Une erreur est survenue lors de la validation du mot de passe')
    }
  }

  /**
   * Asynchronously loads players and chat messages data for a game.
   *
   * This function fetches the list of players and chat messages for a given game ID
   * if the `gameId` is valid and the user is authorized. It updates the state with
   * the fetched players and messages data, sets the loading state to `false`,
   * and determines whether the game can be started based on the readiness of players.
   *
   * The game can start if all players (excluding the creator) are marked as ready
   * and the total number of players matches the maximum allowed for the game room.
   *
   * Handles errors during the data fetching process by logging them to the console.
   *
   * Preconditions:
   * - `gameId` must be defined and valid.
   * - The user must be authorized.
   *
   * State Updates:
   * - Updates the players state with the fetched players data.
   * - Updates the messages state with the fetched chat messages data.
   * - Updates the loading state to `false`.
   * - Sets the ability to start the game (`canStartGame`) based on readiness and player count.
   *
   * Error Handling:
   * Logs any errors encountered during the fetching process to the console.
   */
  useEffect(() => {
    /**
     * Asynchronously loads the room data for the specified game by fetching its details
     * and updating the relevant state variables. It includes handling authorization,
     * password requirements, and player data initialization.
     *
     * This function will not proceed if gameId or token are not defined.
     * Upon successful data fetch, it sets the following:
     * - Authentication status based on password protection.
     * - Password requirement flag.
     * - Room details, player information, and creator information.
     * - Player and message data if authorized.
     *
     * Handles any errors during the fetch process by logging them to the console.
     *
     * @returns {Promise<void>} A promise that resolves when the room data is successfully loaded or stops due to invalid conditions.
     */
    const loadRoomData = async () => {
      if (!gameId) return
      try {
        const data = await fetchGameDetails(gameId, token ?? null)
        if (data.error) {
          setGameError(data.error)
        } else {
          const authorized = data.room.password ? localStorage.getItem(`game_auth_${gameId}`) === 'true' ?? false : true
          setIsAuthorized(authorized)
          setPasswordRequired(!!data.room.password)
          setRoomData(data.room)
          // On fusionne les données du joueur pour ne pas écraser la carte reçue par socket
          setPlayer(prevPlayer => ({ ...prevPlayer, ...data.player }))
          setViewer(data.viewer)
          setCreator(data.creator)
          setGameStarted(data.room.status === 'in_progress')
          setGameFinished(data.room.status === 'completed')
          setSlots(data.room.maxPlayers)

          if (authorized) {
            setPlayers(data.room.players || [])
            setViewers(data.room.viewers || [])
            setMessages(data.room.tchat || [])
            setLoading(false)

            const playersData = data.room.players || []
            const allPlayersReady = playersData
              .filter((p: Player) => p.playerId !== data.creator?.playerId)
              .every((p: Player) => p.ready)

            if (allPlayersReady && playersData.length === data.room.maxPlayers) {
              setCanStartGame(true)
            } else {
              setCanStartGame(false)
            }
          }

          if (data.room.status === 'completed'
            && isDateMoreThan10MinutesOld(data.room.updatedAt)) {
            setIsArchive(true)
          }
        }
      } catch (err) {
        console.error('Erreur lors du fetchGameDetails : ', err)
      }
    }
    loadRoomData()
  }, [gameId, token, isAuthorized])

  /**
   * Charge la liste des joueurs + messages de chat
   */
  useEffect(() => {
    if (!socket || !gameId || isArchive || !isAuthorized) return

    const handleLobbyStateUpdate = (data: any) => {
      setRoomData(data.room)
      setPlayers(data.room.players)
      setViewers(data.room.viewers)
      if (!gameStarted) {
        setCanStartGame(data.room.players.length === data.room.maxPlayers)
        setCanBeReady(
          (player?.ready ? false : data.room.players.filter((p: { ready: boolean }) => p.ready).length < data.room.maxPlayers)
        )
      }
    }

    const handleEnableStart = () => setCanStartGame(true)
    const handleEnableReadyOption = () => {
      setCanStartGame(
        (player?.ready ? false : players.filter(p => p.ready).length === roomData.maxPlayers)
      )
    }

    const handleNewMessage = (message: Message) => {
      if (message.channel === 2 && isNight) {
        socket.emit('shaman_listen', message)
      }
      setMessages(prev => [...prev, message])
      if (message.sound) {
        const audio = new Audio(`/assets/sounds/${message.sound}.mp3`)
        audio.play().catch(() => {})
      }
      if (player && message.message.toLowerCase().includes(player.nickname.toLowerCase())) {
        const audio = new Audio('/assets/sounds/sos.mp3')
        audio.play().catch(() => {})
      }
    }

    const handleGameStarted = () => {
      setGameStarted(true)
      setIsNight(true)
      socket.emit('game:sync_state', { gameId })
    }

    const handleGameStateUpdate = (data: any) => {
      const payload = Array.isArray(data) ? data[0] : data
      setPlayer(prevPlayer => ({ ...prevPlayer, ...payload.player }))
      if (payload.players) {
        setPlayers(payload.players)
      }
      setAlienList(payload.alienList || [])
      setCoupleList(payload.lovers || [])
      setIsNight(data.phase.startsWith('NIGHT'))
    }

    const handlePhaseChange = (data: any) => {
      if (data.newPhase) {
        setIsNight(data.newPhase.toLowerCase().includes('nuit'))
      }
    }

    const handlePlayerUpdate = (updatedPlayers: Player[]) => {
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers]
        updatedPlayers.forEach(updatedPlayer => {
          const index = newPlayers.findIndex(p => p.id === updatedPlayer.id)
          if (index !== -1) {
            newPlayers[index] = { ...newPlayers[index], ...updatedPlayer }
          }
        })
        return newPlayers
      })
    }

    const handlePrivateNotification = (data: any) => {
      if (data.message.includes('Vous avez été expulsé')) {
        window.location.href = '/'
      } else {
        setMessages(prev => [
          ...prev,
          {
            nickname: 'Système',
            message: data.message,
            icon: data.icon,
            sound: data.sound,
            playerId: -1,
            channel: 0,
            isPerso: true,
            isMeneur: false,
            isMsgSite: false,
            createdAt: new Date(),
          },
        ])
      }
      console.log('Private notification:', data.message)
    }

    const handleGameEnd = () => setGameFinished(true)
    const handleGameDissolved = () => setGameError('Le salon a été détruit par la modération.')
    const handleError = (error: any) => {
      setMessages(prev => [
        ...prev,
        {
          nickname: 'Système',
          message: error.message,
          icon: error.icon,
          sound: error.sound,
          playerId: -1,
          channel: 0,
          isPerso: true,
          isMeneur: false,
          isMsgSite: false,
          createdAt: new Date(),
        },
      ])
    }

    const handlePremiumPanelUpdate = (data: PremiumPlayerStats[]) => {
      setPremiumPanelData(data)
    }

    const handlePlayerRenamed = (newNickname: string) => {
      setPlayer(prevPlayer => prevPlayer ? { ...prevPlayer, nickname: newNickname } : null)
    }

    if (!hasJoined) {
      socket.emit('room:join', { token, roomId: gameId })
      socket.on('room:joined_successfully', () => {
        socket.emit('game:sync_state', { gameId })
      })
      setHasJoined(true)
    }

    socket.on('player:renamed', handlePlayerRenamed)
    socket.on('lobby:state_update', handleLobbyStateUpdate)
    socket.on('lobby:enable_start', handleEnableStart)
    socket.on('lobby:enable_ready_option', handleEnableReadyOption)
    socket.on('tchat:new_message', handleNewMessage)
    socket.on('game:started', handleGameStarted)
    socket.on('game:state_update', handleGameStateUpdate)
    socket.on('phase:change', handlePhaseChange)
    socket.on('player:update', handlePlayerUpdate)
    socket.on('notification:private', handlePrivateNotification)
    socket.on('game:end', handleGameEnd)
    socket.on('game:dissolved', handleGameDissolved)
    socket.on('error', handleError)
    socket.on('game:premium_panel_update', handlePremiumPanelUpdate)

    return () => {
      socket.off('player:renamed', handlePlayerRenamed)
      socket.off('lobby:state_update', handleLobbyStateUpdate)
      socket.off('lobby:enable_start', handleEnableStart)
      socket.off('lobby:enable_ready_option', handleEnableReadyOption)
      socket.off('tchat:new_message', handleNewMessage)
      socket.off('game:started', handleGameStarted)
      socket.off('game:state_update', handleGameStateUpdate)
      socket.off('phase:change', handlePhaseChange)
      socket.off('player:update', handlePlayerUpdate)
      socket.off('notification:private', handlePrivateNotification)
      socket.off('game:end', handleGameEnd)
      socket.off('game:dissolved', handleGameDissolved)
      socket.off('error', handleError)
      socket.off('room:joined_successfully')
      socket.off('game:premium_panel_update', handlePremiumPanelUpdate)
    }
  }, [socket, gameId, token, isAuthorized, hasJoined, isArchive, gameStarted, player, isNight, roomData.maxPlayers])

  return {
    roomData,
    player,
    players,
    viewer,
    viewers,
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
    winnersAvatars,
    premiumPanelData,
    setWinnersAvatars,
    setIsArchive,
    setSlots,
    setPlayer,
    handlePasswordSubmit,
    setPassword,
    setGameError,
    setRoomData,
    setMessages,
    setIsCreator,
    setIsNight,
    setGameStarted,
    setGameFinished,
  }
}
