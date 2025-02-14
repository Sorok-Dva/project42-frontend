import React, { useEffect, useState } from 'react'
import { useUser } from 'contexts/UserContext'
import { useSocket } from 'contexts/SocketContext'
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Button } from '@mui/material'
import axios from 'axios'
import { PlayerType } from 'hooks/useGame'
import { useAuth } from 'contexts/AuthContext'

interface Room {
  id: number
  name: string
  creator: string
  maxPlayers: number
  currentPlayers: number
  players: PlayerType[]
  status: 'waiting' | 'in_progress'
}

const RoomList = () => {
  const { user } = useUser()
  const { token } = useAuth()
  const socket = useSocket().socket
  const [roomsWaiting, setRoomsWaiting] = useState<Room[]>([]) // Rooms en attente
  const [roomsInProgress, setRoomsInProgress] = useState<Room[]>([]) // Rooms en cours
  const [playerRoomId, setPlayerRoomId] = useState<number | null>(null) // Room actuelle du joueur
  const [hoveredRow, setHoveredRow] = useState<number | null>(null) // Ligne survolée

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

  const handleSpectateRoom = async (roomId: number) => {
    if (playerRoomId) {
      alert('Vous êtes déjà dans une partie. Quittez votre partie actuelle pour en regarder une autre.')
      return
    }
    try {
      const response = await axios.post(`/api/games/room/${roomId}/spectate`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
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
        localStorage.removeItem(`game_auth_${playerRoomId}`)
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
      <Typography variant="h4" gutterBottom className='mt-2'>
        Liste des parties en attente
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: '#1976d2', color: 'white' }}>
              <TableCell style={{ color: 'white' }}>Nom</TableCell>
              <TableCell style={{ color: 'white' }}>Créateur</TableCell>
              <TableCell style={{ color: 'white' }}>Places</TableCell>
              <TableCell style={{ color: 'white' }}>Options</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roomsWaiting.length > 0 ? (
              roomsWaiting.map((room) => (
                <Tooltip
                  key={room.id}
                  title={
                    <Box>
                      <Typography variant="subtitle1">Joueurs :</Typography>
                      {room.players.map((player) => (
                        <Typography variant="body2" key={player.nickname}>
                          {player.nickname}
                        </Typography>
                      ))}
                    </Box>
                  }
                  placement="top"
                  arrow
                >
                  <TableRow
                    hover
                    onMouseEnter={() => setHoveredRow(room.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: hoveredRow === room.id ? '#e3f2fd' : 'white',
                    }}
                  >
                    <TableCell>{room.name}</TableCell>
                    <TableCell>{room.creator}</TableCell>
                    <TableCell>{`${room.currentPlayers}/${room.maxPlayers}`}</TableCell>
                    <TableCell>
                      {hoveredRow === room.id && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleJoinRoom(room.id)}
                          disabled={!!playerRoomId}
                        >
                          Jouer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                </Tooltip>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucune partie en attente.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h4" gutterBottom className='mt-4'>
        Parties en cours
      </Typography>

      {/* Parties en cours */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow style={{ backgroundColor: '#2e7d32', color: 'white' }}>
              <TableCell style={{ color: 'white' }}>Nom</TableCell>
              <TableCell style={{ color: 'white' }}>Créateur</TableCell>
              <TableCell style={{ color: 'white' }}>Places</TableCell>
              <TableCell style={{ color: 'white' }}>Options</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roomsInProgress.length > 0 ? (
              roomsInProgress.map((room) => (
                <Tooltip
                  key={room.id}
                  title={
                    room.players && room.players.length > 0 ? (
                      <Box>
                        <Typography variant="subtitle1">Joueurs :</Typography>
                        {room.players.map((player) => (
                          <Typography variant="body2" key={player.id}>
                            {player.nickname}
                          </Typography>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2">Aucun joueur dans cette partie</Typography>
                    )
                  }
                  placement="top"
                  arrow
                >
                  <TableRow
                    hover
                    onMouseEnter={() => setHoveredRow(room.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: hoveredRow === room.id ? '#e8f5e9' : 'white',
                    }}
                  >
                    <TableCell>{room.name}</TableCell>
                    <TableCell>{room.creator}</TableCell>
                    <TableCell>{`${room.currentPlayers}/${room.maxPlayers}`}</TableCell>
                    <TableCell>
                      <Button variant="contained" disabled>
                        En cours
                      </Button>
                      <Button variant="contained" onClick={() => handleSpectateRoom(room.id)}>
                        Observer
                      </Button>
                    </TableCell>
                  </TableRow>
                </Tooltip>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucune partie en cours.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default RoomList
