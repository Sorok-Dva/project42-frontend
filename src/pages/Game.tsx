import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useUser } from 'context/UserContext'
import { useSocket } from 'context/SocketContext'
import { Box, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material'
import axios from 'axios'
import 'styles/GamePage.css'

interface RoomData {
  id: number;
  name: string;
  type: number;
  maxPlayers: number;
}

interface Message {
  nickname: string;
  message: string;
  playerId: number;
  channel: number;
  createdAt: Date;
}

export const GAME_TYPES: Record<number, string> = {
  0: 'Normal',
  1: 'Fun',
  2: 'Sérieuse',
  3: 'Carnage',
}

const GamePage = () => {
  const { id: gameId } = useParams<{ id: string }>()
  const { user } = useUser()
  const socket = useSocket().socket
  const playerId = user?.id

  const [roomData, setRoomData] = useState<RoomData>({
    id: 0,
    name: 'Chargement...',
    type: 0,
    maxPlayers: 6,
  })
  const [isCreator, setIsCreator] = useState(false) // Si l'utilisateur est le créateur
  const [players, setPlayers] = useState<any[]>([]) // Liste des joueurs
  const [hasJoined, setHasJoined] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('') // Nouveau message du chat
  const [gameDetails, setGameDetails] = useState<any>(null) // Détails de la partie
  const [gameError, setGameError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null) // Référence pour scroller en bas

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios(`/api/games/room/${gameId}`)
        if (response.data.error) {
          return setGameError(response.data.error)
        }
        setRoomData(response.data)
      } catch (err) {
        console.error('Failed to fetch room data', err)
      }
    }

    fetchRoomData()
  }, [gameId])

  useEffect(() => {
    fetchGameDetails()
    fetchPlayers()
    fetchChatMessages()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!socket) return

    socket.onAny((eventName, ...args) => {
      console.log(`Événement reçu : ${eventName}`, args)
    })

    return () => {
      socket.offAny()
    }
  }, [socket])

  useEffect(() => {
    if (!socket || !user) return

    const handlePlayerLeft = (data: { message: string }) => {
      console.log('Événement playerLeft reçu:', data) // Debug
      setMessages((prev) => [
        ...prev,
        {
          nickname: 'Système',
          message: data.message,
          playerId: -1,
          channel: 0,
          createdAt: new Date(),
        },
      ])

      if (data.message.includes(user?.nickname)) {
        setGameError('Vous avez bien quitté la partie. Vous pouvez fermer cet onglet.')
      }
    }

    socket.on('playerLeft', handlePlayerLeft)

    return () => {
      socket.off('playerLeft', handlePlayerLeft)
    }
  }, [socket, user])

  useEffect(() => {
    if (!socket || !gameId || !user || hasJoined) return

    socket.emit('joinRoom', {
      roomId: gameId,
      player: { id: user.id, nickname: user.nickname },
    })

    socket.on('playerJoined', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          nickname: 'Système',
          message: data.message,
          playerId: -1,
          channel: 0,
          createdAt: new Date()
        },
      ])
    })

    socket.on('updatePlayers', (updatedPlayers) => {
      setPlayers(updatedPlayers)
    })

    setHasJoined(true)

    // return () => {
    //   socket.off('playerJoined')
    //   socket.off('updatePlayers')
    // }
  }, [socket, gameId, user, hasJoined])

  useEffect(() => {
    if (!socket) return

    // Recevoir les messages
    socket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      socket.off('newMessage')
    }
  }, [socket])

  const fetchGameDetails = async () => {
    try {
      const { data } = await axios.get(`/api/games/room/${gameId}`)
      setGameDetails(data)
      setIsCreator(data.creatorId === playerId) // Vérifie si l'utilisateur est le créateur
    } catch (error) {
      console.error('Erreur lors du chargement des détails de la partie:', error)
    }
  }

  const fetchPlayers = async () => {
    try {
      const { data } = await axios.get(`/api/games/room/${gameId}/players`)
      setPlayers(data)
    } catch (error) {
      console.error('Erreur lors du chargement des joueurs:', error)
    }
  }

  const fetchChatMessages = async () => {
    try {
      const { data } = await axios.get(`/api/games/room/${gameId}/tchat`)
      setMessages(data)
    } catch (error) {
      console.error('Erreur lors du chargement du chat:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    try {
      socket.emit('sendMessage', {
        roomId: gameId,
        playerId: user?.id,
        content: newMessage,
      })
      setNewMessage('')
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    }
  }

  const handleClearChat = async () => {
    try {
      await axios.delete(`/api/games/${gameId}/chat`)
      fetchChatMessages()
    } catch (error) {
      console.error('Erreur lors de l\'effacement du chat:', error)
    }
  }

  const handleLeaveGame = async () => {
    try {
      const response = await axios.post('/api/games/players/room/leave', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (response.data.message) {
        socket.emit('leaveRoom', {
          roomId: gameId,
          player: { id: user?.id, nickname: user?.nickname },
        })
        setGameError('Vous avez bien quitter votre partie. Vous pouvez fermer cet onglet.')
      }
    } catch (error) {
      console.error('Erreur lors de la sortie de la partie:', error)
    }
  }

  const handleStartGame = async () => {
    try {
      await axios.post(`/api/games/${gameId}/start`)
      fetchGameDetails() // Actualiser les détails
    } catch (error) {
      console.error('Erreur lors du lancement de la partie:', error)
    }
  }

  const handleTransferCreator = async (newCreatorId: string) => {
    try {
      await axios.post(`/api/games/${gameId}/transfer`, { newCreatorId })
      fetchGameDetails() // Actualiser les détails
    } catch (error) {
      console.error('Erreur lors du transfert des droits de créateur:', error)
    }
  }

  if (gameError) {
    return (
      <div className="alert alert-danger">{gameError}</div>
    )
  }

  return (
    <Box display="flex" flexDirection="column" flex={1} p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" gutterBottom>
          [{GAME_TYPES[roomData.type]}] Partie : {roomData.name} ({players.length}/{roomData.maxPlayers})
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleLeaveGame()}
      >
        Quitter la partie
      </Button>

      <Typography variant="h6" gutterBottom>
        Joueurs ({players.length}/{roomData.maxPlayers})
      </Typography>
      <List>
        {players.map((player, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={player.nickname}
              secondary={
                player.ready
                  ? 'Prêt'
                  : 'Non prêt'
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Affichage des messages */}
      <Box flex={1} bgcolor="#f5f5f5" p={2} overflow="auto" minHeight="400px">
        {messages.map((msg, index) => (
          <Typography key={index} variant="body1">
            <small>[{new Date(msg.createdAt).toLocaleTimeString()}]</small>
            {' '}
            <strong>{msg.nickname}:</strong> {msg.message}
          </Typography>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Zone de saisie des messages */}
      <Box mt={2} display="flex">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Saisir un message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage()
            }
          }}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Envoyer
        </Button>
      </Box>
    </Box>
  )
}

export default GamePage
