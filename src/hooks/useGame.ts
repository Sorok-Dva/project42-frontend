import { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'
import { fetchRoomData, fetchPlayers, fetchChatMessages } from '../services/gameService'

interface Message {
  nickname: string
  message: string
  playerId: number
  channel: number
  icon: string | null
  createdAt: Date
}

interface PlayerType {
  id: string
  nickname: string
  ready: boolean
}

interface RoomData {
  id: number
  creator: string
  name: string
  type: number
  maxPlayers: number
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
  })
  const [player, setPlayer] = useState<PlayerType | null>(null)
  const [players, setPlayers] = useState<PlayerType[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [canBeReady, setCanBeReady] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [gameError, setGameError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  /**
   * Scrolle automatiquement en bas de la liste des messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  /**
   * Chargement initial des données de la room + player
   */
  useEffect(() => {
    const loadRoomData = async () => {
      if (!gameId || !token) return
      try {
        const data = await fetchRoomData(gameId, token)
        if (data.error) {
          setGameError(data.error)
        } else {
          const { creator } = data.room
          setRoomData(data.room)
          setPlayer(data.player)
        }
      } catch (err) {
        console.error('Erreur lors du fetchRoomData : ', err)
      }
    }
    loadRoomData()
  }, [gameId, token])

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

    socket.on('error', (error: any) => {
      setMessages((prev) => [
        ...prev,
        {
          nickname: 'Système',
          message: error.message,
          playerId: -1,
          channel: 0,
          icon: '',
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
    messages,
    canBeReady,
    gameError,
    loading,
    messagesEndRef,
    setGameError,
    setRoomData,
    setMessages,
  }
}
