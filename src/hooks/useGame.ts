import { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { fetchRoomData, fetchPlayers, fetchChatMessages } from '../services/gameService'
import axios from 'axios'

export interface Message {
  nickname: string
  message: string
  playerId: number
  channel: number
  icon: string | null
  createdAt: Date
}

export interface UserType {
  id: string
  nickname: string
}

export interface PlayerType {
  id: string
  nickname: string
  ready: boolean
}

export interface RoomData {
  id: number
  creator: string
  name: string
  type: number
  maxPlayers: number
  isPrivate: boolean
  password?: string
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
    type: 0,
    maxPlayers: 6,
    isPrivate: true
  })
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [password, setPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [player, setPlayer] = useState<PlayerType | null>(null)
  const [players, setPlayers] = useState<PlayerType[]>([])
  const [creator, setCreator] = useState<UserType | null>(null)
  const [isCreator, setIsCreator] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [canBeReady, setCanBeReady] = useState(false)
  const [canStartGame, setCanStartGame] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [gameError, setGameError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  /**
   * scrollToBottom is a function that scrolls the view to the bottom of a container.
   * It ensures that the UI automatically scrolls to the most recent content,
   * providing a smooth scrolling effect.
   *
   * The function utilizes a reference (messagesEndRef) to the DOM element
   * and invokes the scrollIntoView method with the 'smooth' behavior.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const joinGame = async () => {
    try {
      const response = await axios.post(`/api/games/room/${gameId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      localStorage.setItem(`game_auth_${gameId}`, 'true')
      setIsAuthorized(true)
    } catch (error) {
      console.error('Erreur lors de la tentative de rejoindre la partie :', error)
    }
  }

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
      })

      if (response.data.success) {
        localStorage.setItem(`game_auth_${gameId}`, 'true')
        setIsAuthorized(true)
        setPasswordRequired(false)
      } else {
        alert('Mot de passe incorrect')
      }
    } catch (error) {
      alert('Erreur lors de la validation du mot de passe')
    }
  }

  useEffect(() => {
    const checkPasswordRequirement = async () => {
      try {
        const { data: roomData } = await axios.get(`/api/games/room/${gameId}`)
        if (roomData.password) {
          const storedAuth = localStorage.getItem(`game_auth_${gameId}`)
          if (!storedAuth) {
            setPasswordRequired(true) // Demander le mot de passe
          } else {
            joinGame() // Joindre directement si déjà validé
          }
        } else {
          joinGame() // Joindre directement si pas de mot de passe
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du mot de passe :', error)
      }
    }
    checkPasswordRequirement()
  }, [gameId])

  /**
   * Chargement initial des données de la room + player + creator
   */
  useEffect(() => {
    const loadRoomData = async () => {
      if (!gameId || !token) return
      try {
        const data = await fetchRoomData(gameId, token)
        if (data.error) {
          setGameError(data.error)
        } else {
          setRoomData(data.room)
          setPlayer(data.player)
          setCreator(data.creator)
        }
      } catch (err) {
        console.error('Erreur lors du fetchRoomData : ', err)
      }
    }
    loadRoomData()
  }, [gameId, token])

  useEffect(() => {
    if (roomData?.password) {
      const storedAuth = localStorage.getItem(`game_auth_${gameId}`)
      if (!storedAuth) {
        setPasswordRequired(true)
      } else {
        setIsAuthorized(true)
      }
    }
  }, [roomData, gameId])

  /**
   * Charge la liste des joueurs + messages de chat
   */
  useEffect(() => {
    const loadPlayersAndMessages = async () => {
      if (!gameId) return
      try {
        const [playersData, chatData] = await Promise.all([
          fetchPlayers(gameId),
          fetchChatMessages(gameId),
        ])
        setPlayers(playersData)
        setMessages(chatData)
        setLoading(false)

        const allPlayersReady = playersData
          .filter((player: PlayerType) => player.id !== creator?.id)
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
    loadPlayersAndMessages()
  }, [gameId])

  /**
   * Gère les listeners socket
   */
  useEffect(() => {
    if (!socket || !gameId || !user) return

    // 1) Rejoint la room si pas déjà fait
    if (!hasJoined) {
      socket.emit('joinRoom', {
        roomId: gameId,
        player: { id: user.id, nickname: user.nickname },
      })
      setHasJoined(true)
    }

    // 2) Réception d'événements
    socket.on('playerJoined', (data) => {
      if (data.sound) {
        const audio = new Audio(`/assets/sounds/${data.sound}.mp3`)
        audio.play()
      }
      setMessages((prev) => [
        ...prev,
        {
          nickname: 'Système',
          message: data.message,
          playerId: -1,
          channel: 0,
          icon: data.icon,
          createdAt: new Date(),
        },
      ])
    })

    socket.on('updatePlayers', (updatedPlayers: PlayerType[]) => {
      setPlayers(updatedPlayers)
      // Exemple de logique : autoriser le "ready" si le nombre de joueurs max est atteint
      // if (updatedPlayers.length >= roomData.maxPlayers) setCanBeReady(true)
      // Pour l'instant on le laisse tel quel :
    })

    socket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message])
      if (message.message.toLowerCase().includes(player?.nickname.toLowerCase())) {
        const audio = new Audio('/assets/sounds/sos.mp3')
        audio.play()
      }
    })

    socket.on('playerLeft', (data) => {
      if (data.sound) {
        const audio = new Audio(`/assets/sounds/${data.sound}.mp3`)
        audio.play()
      }
      setMessages((prev) => [
        ...prev,
        {
          nickname: 'Système',
          message: data.message,
          playerId: -1,
          channel: 0,
          icon: data.icon ?? '',
          createdAt: new Date(),
        },
      ])
      if (data.message.includes(user.nickname)) {
        setGameError('Vous avez quitté la partie. Vous pouvez fermer cet onglet.')
      }
    })

    socket.on('playerKicked', (data: { nickname: string; sound: string }) => {
      if (data.nickname === player?.nickname) {
        setGameError('Vous avez été expulsé de la partie.')
      }
      if (data.sound) {
        const audio = new Audio(`/assets/sounds/${data.sound}.mp3`)
        audio.play()
      }
    })

    socket.on('enableReadyOption', (state: boolean) => {
      setCanBeReady(state)
    })

    socket.on('enableStartGame', (state: boolean) => {
      setCanStartGame(state)
    })

    socket.on('newCreator', (creatorData: PlayerType) => {
      console.log('newCreator', creatorData)
      setCreator(creatorData)
    })

    socket.on('nicknameChanged', (newNickname: string) => {
      setPlayer(prevPlayer => prevPlayer ? { ...prevPlayer, nickname: newNickname } : null)
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
      socket.off('error')
    }
  }, [socket, gameId, user, player, hasJoined, roomData.maxPlayers])

  /**
   * Scroll auto en bas des messages à chaque nouveau message
   */
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return {
    roomData,
    player,
    players,
    creator,
    isCreator,
    messages,
    canBeReady,
    canStartGame,
    gameError,
    loading,
    messagesEndRef,
    passwordRequired,
    isAuthorized,
    password,
    handlePasswordSubmit,
    setPassword,
    setGameError,
    setRoomData,
    setMessages,
    setIsCreator,
  }
}
