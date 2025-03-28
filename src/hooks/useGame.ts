import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import {
  fetchGameDetails,
  fetchPlayers,
  fetchChatMessages,
  fetchViewers,
} from '../services/gameService'
import axios from 'axios'

export interface Message {
  nickname: string
  message: string
  playerId: number
  channel: number
  icon: string | null
  isMeneur: boolean
  isPerso: boolean
  isMsgSite: boolean
  cssClass?: string | null
  createdAt: Date
}

export interface UserType {
  id: string
  nickname: string
}

export interface PlayerType {
  id: string
  playerId: string
  nickname: string
  ready: boolean
  alive: boolean
  card?: { id: number; name: string; description: string; }
  inLove: boolean
  isSister: boolean
  isBrother: boolean
  isCharmed: boolean
  isInfected: boolean
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
  phase: number
  cards: RoomCard[]
  players?: Partial<PlayerType>[]
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
    cards: [],
    phase: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [password, setPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [player, setPlayer] = useState<PlayerType | null>(null)
  const [players, setPlayers] = useState<PlayerType[]>([])
  const [viewer, setViewer] = useState<Viewer | null>(null)
  const [viewers, setViewers] = useState<Viewer[]>([])
  const [creator, setCreator] = useState<PlayerType | null>(null)
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
        loadPlayersAndMessages(true)
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
  const loadPlayersAndMessages = async (authorized?: boolean) => {
    if (!gameId || !authorized) return
    try {
      const [playersData, viewersData, chatData] = await Promise.all([
        fetchPlayers(gameId),
        fetchViewers(gameId),
        fetchChatMessages(gameId, token),
      ])
      setPlayers(playersData)
      setViewers(viewersData)
      setMessages(chatData)
      setLoading(false)

      const allPlayersReady = playersData
        .filter((player: PlayerType) => player.playerId !== creator?.playerId)
        .every((player: PlayerType) => player.ready)

      if (allPlayersReady && playersData.length === roomData.maxPlayers) {
        setCanStartGame(true)
      } else {
        setCanStartGame(false)
      }
    } catch (error) {
      console.error('Erreur lors du chargement initial :', error)
    }
  }

  /**
   * Chargement initial des données de la room + player + creator
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
          setPlayer(data.player)
          setViewer(data.viewer)
          setCreator(data.creator)
          setGameStarted(data.room.status === 'in_progress')
          setGameFinished(data.room.status === 'completed')
          setSlots(data.room.maxPlayers)

          loadPlayersAndMessages(authorized)

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
    loadPlayersAndMessages(isAuthorized)
  }, [gameId])

  /**
   * Gère les listeners socket
   */
  useEffect(() => {
    if (!socket || !gameId || !user) return

    // 1) Rejoint la room si pas déjà fait
    if (!hasJoined && isAuthorized) {
      socket.emit('joinRoom', {
        roomId: gameId,
        player: !user ? null : { id: user.id, nickname: user.nickname },
        viewer,
      })
      setHasJoined(true)
    }

    // 2) Réception d'événements
    socket.on('playerJoined', (data) => {
      if (data.sound) {
        const audio = new Audio(`/assets/sounds/${data.sound}.mp3`)
        audio.volume = 0.5
        audio.play().catch(() => {})
      }
      setMessages((prev) => [
        ...prev,
        {
          nickname: 'Système',
          message: data.message,
          playerId: -1,
          channel: 0,
          icon: data.icon,
          isMeneur: false,
          isPerso: false,
          isMsgSite: false,
          createdAt: new Date(),
        },
      ])
    })

    socket.on('updatePlayers', (updatedPlayers: PlayerType[]) => {
      setPlayers(updatedPlayers)
      if (updatedPlayers.length >= roomData.maxPlayers) setCanBeReady(true)
    })

    socket.on('updateViewers', (updatedViewers: Viewer[]) => {
      setViewers(updatedViewers)
    })

    socket.on('newMessage', (message) => {
      if (message.channel === 2 && isNight) {
        socket.emit('shaman_listen', message)
      }
      setMessages((prev) => [...prev, message])
      if (message.sound) {
        const audio = new Audio(`/assets/sounds/${message.sound}.mp3`)
        audio.play().catch(() => {})
      }
      if (message.message.toLowerCase().includes(player?.nickname.toLowerCase())) {
        const audio = new Audio('/assets/sounds/sos.mp3')
        audio.play().catch(() => {})
      }
    })

    socket.on('playerLeft', (player) => {
      if (player === user.nickname) {
        setGameError('Vous avez quitté la partie. Vous pouvez fermer cet onglet.')
      }
    })

    socket.on('playerKicked', (data: { nickname: string; sound: string }) => {
      if (data.nickname === player?.nickname) {
        setGameError('Vous avez été expulsé de la partie.')
      }
      if (data.sound) {
        const audio = new Audio(`/assets/sounds/${data.sound}.mp3`)
        audio.volume = 0.5
        audio.play().catch(() => {})
      }
    })

    socket.on('enableReadyOption', (state: boolean) => {
      setCanBeReady(state)
    })

    socket.on('enableStartGame', (state: boolean) => {
      setCanStartGame(state)
    })

    socket.on('newCreator', (creatorData: PlayerType) => {
      setCreator(creatorData)
    })

    socket.on('nicknameChanged', (newNickname: string) => {
      setPlayer(prevPlayer => prevPlayer ? { ...prevPlayer, nickname: newNickname } : null)
    })

    socket.on('nightStarted', (nightStarted: boolean) => {
      setIsNight(nightStarted)
    })

    socket.on('gameFinished', (room: RoomData) => {
      // @todo join viewers channel
      setGameFinished(true)
      setIsNight(true)
    })

    socket.on('updateCards', (cards: RoomCard[]) => {
      setRoomData(prevRoom => ({ ...prevRoom, cards }))
    })

    socket.on('alienList', (list: string[]) => {
      setAlienList(list)
    })

    socket.on('sistersList', (list: string[]) => {
      setSisterList(list)
    })

    socket.on('brothersList', (list: string[]) => {
      setBrothersList(list)
    })

    socket.on('coupleList', (list: string[]) => {
      setCoupleList(list)
    })

    socket.on('inn_list', (list: string[]) => {
      if (list.includes(player?.nickname || 'Joueur introuvable')) {
        setIsInn(true)
        setInnList(list)
      }
    })

    socket.on('dead', () => {
      setPlayer(prevPlayer => prevPlayer ? { ...prevPlayer, alive: false } : null)
    })

    socket.on('infected', () => {
      setPlayer(prevPlayer => prevPlayer ? { ...prevPlayer, isInfected: true } : null)
    })

    socket.on('dissolve', () => {
      setGameError('Le salon a été détruit par la modération.')
    })

    socket.on('error', (error: any) => {
      setMessages((prev) => [
        ...prev,
        {
          nickname: 'Système',
          message: error.message,
          icon: error.icon,
          playerId: -1,
          channel: 0,
          isPerso: true,
          isMeneur: false,
          isMsgSite: false,
          createdAt: new Date(),
        },
      ])
    })

    // Permet de nettoyer les listeners au démontage
    return () => {
      socket.off('playerJoined')
      socket.off('updatePlayers')
      socket.off('newMessage')
      socket.off('playerLeft')
      socket.off('playerKicked')
      socket.off('enableReadyOption')
      socket.off('enableStartGame')
      socket.off('nightStarted')
      socket.off('gameFinished')
      socket.off('updateCards')
      socket.off('alienList')
      socket.off('coupleList')
      socket.off('inn_list')
      socket.off('dead')
      socket.off('dissolve')
      socket.off('error')
    }
  }, [socket, gameId, user, player, hasJoined, isAuthorized, isNight, roomData.maxPlayers])

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
