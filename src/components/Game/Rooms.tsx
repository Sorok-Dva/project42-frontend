import React, { useEffect, useState } from 'react'
import { useUser } from 'context/UserContext'
import { useSocket } from 'context/SocketContext'
import { Box, Typography, Button, Card, CardContent, CardActions } from '@mui/material'
import axios from 'axios'

interface Room {
  id: number
  name: string
  maxPlayers: number
  currentPlayers: number
  status: 'waiting' | 'in_progress'
}

const RoomList = () => {
  const { user } = useUser()
  const socket = useSocket().socket
  const [roomsWaiting, setRoomsWaiting] = useState<Room[]>([]) // Rooms en attente
  const [roomsInProgress, setRoomsInProgress] = useState<Room[]>([]) // Rooms en cours
  const [playerRoomId, setPlayerRoomId] = useState<number | null>(null) // Room actuelle du joueur

  useEffect(() => {
    fetchRooms()
    fetchPlayerRoom()

    socket.on('roomsUpdated', fetchRooms)

    return () => {
      socket.off('roomsUpdated')
    }
  }, [])

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
      alert(data.message.includes(user?.nickname))

      if (data.message.includes(user?.nickname)) {
        setPlayerRoomId(null)
        fetchRooms()
      }
    }

    socket.on('selfLeaveGame', handlePlayerLeft)

    // return () => {
    //   socket.off('playerLeft', handlePlayerLeft)
    // }
  }, [socket, user])

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get('/api/games/rooms')
      const waiting = data.filter((room: Room) => room.status === 'waiting')
      const inProgress = data.filter((room: Room) => room.status === 'in_progress')
      setRoomsWaiting(waiting)
      setRoomsInProgress(inProgress)
    } catch (error) {
      console.error('Erreur lors de la récupération des rooms :', error)
    }
  }

  const fetchPlayerRoom = async () => {
    try {
      const { data } = await axios.get('/api/games/players/room', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      setPlayerRoomId(data?.roomId || null)
    } catch (error) {
      console.error('Erreur lors de la récupération de la room du joueur :', error)
    }
  }

  const handleJoinRoom = async (roomId: number) => {
    if (playerRoomId) {
      alert('Vous êtes déjà dans une partie. Quittez votre partie actuelle pour en rejoindre une autre.')
      return
    }
    try {
      const response = await axios.post(`/api/games/room/${roomId}/join`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      setPlayerRoomId(roomId)
      window.open(`/game/${response.data.game.id}`, '_blank')
      fetchRooms()
    } catch (error: any) {
      if (error.response?.data?.error) {
        alert(error.response.data.error)
      } else {
        alert('Erreur lors de la tentative de rejoindre la partie.')
      }
    }
  }

  const handleJoinCurrentRoom = async () => {
    if (!playerRoomId) {
      alert('Vous n\'êtes pas dans une partie.')
      return
    }
    window.open(`/game/${playerRoomId}`, '_blank')
  }

  const handleLeaveRoom = async () => {
    if (!playerRoomId) {
      alert('Vous n\'êtes dans aucune partie.')
      return
    }
    try {
      const response = await axios.post('/api/games/players/room/leave', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (response.data.message) {
        socket.emit('leaveRoom', {
          roomId: playerRoomId,
          player: { id: user?.id, nickname: user?.nickname },
        })
        setPlayerRoomId(null)
        alert('Vous avez bien quitter votre partie.')
        fetchRooms()
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        alert(error.response.data.error)
      } else {
        alert('Erreur lors de la tentative de quitter la partie.')
      }
    }
  }

  return (
    <Box p={2}>
      { playerRoomId && (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleJoinCurrentRoom()}
          >
            Rejoindre la partie en cours
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleLeaveRoom()}
          >
            Quitter la partie
          </Button>
        </>
      )}
      <Typography variant="h4" gutterBottom>
        Liste des parties
      </Typography>

      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Parties en attente de lancement
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {roomsWaiting.length > 0 ? (
            roomsWaiting.map((room) => (
              <Card key={room.id} sx={{ width: 300 }}>
                <CardContent>
                  <Typography variant="h6">{room.name}</Typography>
                  <Typography variant="body2">
                    {room.currentPlayers}/{room.maxPlayers} joueurs
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={!!playerRoomId}
                  >
                    Rejoindre
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography variant="body1">Aucune partie en attente.</Typography>
          )}
        </Box>
      </Box>

      <Box>
        <Typography variant="h5" gutterBottom>
          Parties en cours
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {roomsInProgress.length > 0 ? (
            roomsInProgress.map((room) => (
              <Card key={room.id} sx={{ width: 300 }}>
                <CardContent>
                  <Typography variant="h6">{room.name}</Typography>
                  <Typography variant="body2">
                    {room.currentPlayers}/{room.maxPlayers} joueurs
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" disabled>
                    En cours
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography variant="body1">Aucune partie en cours.</Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default RoomList
